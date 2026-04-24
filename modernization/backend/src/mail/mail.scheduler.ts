import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
import { User } from '../users/entities/user.entity';
import { Statistics } from '../statistics/entities/statistics.entity';
import { PilotLicenseExpenseUser } from '../licenses/entities/pilot-license-expense-user.entity';
import { LicenseWarningData } from './interfaces/mail.interfaces';

@Injectable()
export class MailScheduler {
  private readonly logger = new Logger(MailScheduler.name);
  private isJobRunning = false;

  constructor(
    private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Statistics)
    private readonly statisticsRepository: Repository<Statistics>,
    @InjectRepository(PilotLicenseExpenseUser)
    private readonly licenseExpenseRepository: Repository<PilotLicenseExpenseUser>,
  ) {}

  /**
   * License expiration warning job
   * Runs every 3 hours - same as legacy WarningEmailJob
   */
  @Cron('0 */3 * * *')  //  @Cron('*/1 * * * *') //Runs every 1 minutes for testing
  async handleLicenseWarningJob(): Promise<void> {
    // Prevent concurrent execution
    if (this.isJobRunning) {
      this.logger.warn('License warning job already running, skipping...');
      return;
    }

    this.isJobRunning = true;
    this.logger.log('Starting license expiration warning job...');

    try {
      // Check licenses expiring in next 12 hours
      const checkDate = new Date();
      checkDate.setHours(checkDate.getHours() + 12);

      // Find users with expiring licenses who want warnings and haven't been notified yet
      const expiringLicenses = await this.licenseExpenseRepository
        .createQueryBuilder('expense')
        .innerJoinAndSelect('expense.user', 'user')
        .innerJoinAndSelect('expense.pilotLicenseExpense', 'license')
        .innerJoin('statisticsdbmodels', 'stats', 'stats.userId = user.id')
        .where('expense.maturityDate < :checkDate', { checkDate })
        .andWhere('stats.sendLicenseWarning = true')
        .andWhere('stats.licenseWarningSent = false')
        .andWhere('user.emailConfirmed = true')
        .getMany();

      // Group by user
      const groupedByUser = new Map<string, typeof expiringLicenses>();
      
      for (const expense of expiringLicenses) {
        const userId = expense.user.id;
        if (!groupedByUser.has(userId)) {
          groupedByUser.set(userId, []);
        }
        groupedByUser.get(userId)!.push(expense);
      }

      this.logger.log(`Found ${groupedByUser.size} users with expiring licenses`);

      // Send emails in batches to avoid overwhelming the system
      const batchSize = 50;
      const userGroups = Array.from(groupedByUser.entries());
      
      for (let i = 0; i < userGroups.length; i += batchSize) {
        const batch = userGroups.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async ([userId, expenses]) => {
            try {
              const user = expenses[0].user;
              const now = new Date();
              
              const licenseData = expenses.map(exp => ({
                name: exp.pilotLicenseExpense.name,
                maturityDate: exp.maturityDate,
                daysUntilExpiry: Math.ceil(
                  (exp.maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                ),
              }));

              const warningData: LicenseWarningData = {
                userId: user.id,
                userName: user.userName,
                userEmail: user.email,
                licenses: licenseData,
              };

              await this.mailService.sendLicenseWarningEmail(warningData);

              // Mark as sent
              await this.statisticsRepository.update(
                { user: { id: userId } },
                { licenseWarningSent: true }
              );

              this.logger.log(`License warning sent to ${user.email} (${expenses.length} licenses)`);
            } catch (error) {
              this.logger.error(
                `Failed to send license warning to user ${userId}`,
                error
              );
            }
          })
        );

        // Delay between batches to avoid rate limiting
        if (i + batchSize < userGroups.length) {
          this.logger.log(`Processed batch ${Math.floor(i / batchSize) + 1}, waiting 5s before next batch...`);
          await this.delay(5000);
        }
      }

      this.logger.log('License expiration warning job completed');
    } catch (error) {
      this.logger.error('License warning job failed:', error);
    } finally {
      this.isJobRunning = false;
    }
  }

  /**
   * Reset warning flags for renewed licenses
   * Runs daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetWarningFlags(): Promise<void> {
    this.logger.log('Resetting license warning flags for renewed licenses...');

    try {
      const now = new Date();

      // Find users whose licenses have been renewed (maturityDate > now)
      const renewedLicenses = await this.licenseExpenseRepository
        .createQueryBuilder('expense')
        .innerJoin('expense.user', 'user')
        .where('expense.maturityDate > :now', { now })
        .select('DISTINCT user.id', 'userId')
        .getRawMany();

      if (renewedLicenses.length === 0) {
        this.logger.log('No renewed licenses found');
        return;
      }

      const userIds = renewedLicenses.map(r => r.userId);

      // Reset warning sent flag
      await this.statisticsRepository
        .createQueryBuilder()
        .update()
        .set({ licenseWarningSent: false })
        .where('userId IN (:...userIds)', { userIds })
        .execute();

      this.logger.log(`Reset warning flags for ${userIds.length} users`);
    } catch (error) {
      this.logger.error('Failed to reset warning flags:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
