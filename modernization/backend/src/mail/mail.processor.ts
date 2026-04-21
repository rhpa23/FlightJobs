import { Process, Processor, OnQueueFailed, OnQueueStalled } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailService } from './mail.service';
import { SendMailOptions } from './interfaces/mail.interfaces';

@Processor('mail-queue')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {}

  @Process('send-mail')
  async handleSendMail(job: Job<SendMailOptions>): Promise<void> {
    const { data } = job;
    
    this.logger.log(`Processing email job ${job.id}: ${data.subject} -> ${data.to}`);
    
    try {
      await this.mailService.processSendMail(data);
      this.logger.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed:`, error);
      throw error; // Let Bull handle retry
    }
  }

  @OnQueueFailed()
  handleFailedJob(job: Job<SendMailOptions>, error: Error): void {
    const { data } = job;
    this.logger.error(
      `Email job ${job.id} permanently failed after ${job.attemptsMade} attempts: ${data.subject} -> ${data.to}`,
      error.stack,
    );
    
    // TODO: Send alert to admin about failed email
    // This could be integrated with a notification service
  }

  @OnQueueStalled()
  handleStalledJob(job: Job<SendMailOptions>): void {
    const { data } = job;
    this.logger.warn(`Email job ${job.id} stalled: ${data.subject} -> ${data.to}`);
  }
}
