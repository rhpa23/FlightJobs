import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { MailScheduler } from './mail.scheduler';
import { User } from '../users/entities/user.entity';
import { Statistics } from '../statistics/entities/statistics.entity';
import { PilotLicenseExpenseUser } from '../licenses/entities/pilot-license-expense-user.entity';

const useQueue = process.env.MAIL_USE_QUEUE !== 'false';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    ...(useQueue
      ? [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
              redis: {
                host: configService.get<string>('REDIS_HOST', 'localhost'),
                port: configService.get<number>('REDIS_PORT', 6379),
              },
              defaultJobOptions: {
                attempts: 3,
                backoff: {
                  type: 'exponential',
                  delay: 5000,
                },
                removeOnComplete: 100,
                removeOnFail: 50,
              },
            }),
          }),
          BullModule.registerQueue({
            name: 'mail-queue',
          }),
        ]
      : []),
    TypeOrmModule.forFeature([
      User,
      Statistics,
      PilotLicenseExpenseUser,
    ]),
  ],
  providers: [MailService, ...(useQueue ? [MailProcessor] : []), MailScheduler],
  exports: [MailService],
})
export class MailModule {}
