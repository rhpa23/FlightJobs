import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import {
  SendMailOptions,
  WelcomeEmailData,
  PasswordResetData,
  LicenseWarningData,
  AirlineDebtData,
} from './interfaces/mail.interfaces';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private baseTemplate: HandlebarsTemplateDelegate;

  // Rate limiting tracking
  private sentEmailsInHour: number = 0;
  private userEmailCounts: Map<string, { count: number; resetTime: Date }> = new Map();
  private lastHourReset: Date = new Date();

  constructor(
    private configService: ConfigService,
    @InjectQueue('mail-queue') private mailQueue: Queue,
  ) {}

  async onModuleInit() {
    this.initializeTransporter();
    await this.loadTemplates();
    this.registerHandlebarsHelpers();
    this.logger.log('Mail service initialized');
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('MAIL_PORT', 587);
    const user = this.configService.get<string>('MAIL_USER', '');
    const pass = this.configService.get<string>('MAIL_PASS', '');
    const secure = this.configService.get<boolean>('MAIL_SECURE', false);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true para porta 465, false para outras
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP connection failed:', error);
      } else {
        this.logger.log('SMTP connection established successfully');
      }
    });
  }

  private async loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');
    
    try {
      // Load base template
      const baseTemplatePath = path.join(templatesDir, 'base.hbs');
      const baseTemplateContent = fs.readFileSync(baseTemplatePath, 'utf-8');
      this.baseTemplate = handlebars.compile(baseTemplateContent);

      // Load specific templates
      const templateFiles = ['welcome', 'password-reset', 'license-warning', 'airline-debt'];
      
      for (const templateName of templateFiles) {
        const templatePath = path.join(templatesDir, `${templateName}.hbs`);
        if (fs.existsSync(templatePath)) {
          const content = fs.readFileSync(templatePath, 'utf-8');
          this.templates.set(templateName, handlebars.compile(content));
          this.logger.log(`Loaded template: ${templateName}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to load email templates:', error);
    }
  }

  private registerHandlebarsHelpers() {
    handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    });

    handlebars.registerHelper('formatCurrency', (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    });

    handlebars.registerHelper('eq', (a: any, b: any) => a === b);
  }

  /**
   * Check rate limits before sending
   */
  private checkRateLimits(userEmail?: string): boolean {
    const now = new Date();
    
    // Reset hourly counter if needed
    if (now.getTime() - this.lastHourReset.getTime() > 3600000) {
      this.sentEmailsInHour = 0;
      this.lastHourReset = now;
      this.userEmailCounts.clear();
    }

    const globalRateLimit = this.configService.get<number>('MAIL_RATE_LIMIT_PER_HOUR', 100);
    
    // Check global rate limit
    if (this.sentEmailsInHour >= globalRateLimit) {
      this.logger.warn(`Global rate limit reached: ${globalRateLimit} emails/hour`);
      return false;
    }

    // Check user-specific rate limit (5 per hour)
    if (userEmail) {
      const userLimit = 5;
      const userData = this.userEmailCounts.get(userEmail);
      
      if (userData) {
        if (now.getTime() > userData.resetTime.getTime()) {
          // Reset user counter
          this.userEmailCounts.set(userEmail, { count: 1, resetTime: new Date(now.getTime() + 3600000) });
        } else if (userData.count >= userLimit) {
          this.logger.warn(`User rate limit reached for ${userEmail}: ${userLimit} emails/hour`);
          return false;
        } else {
          userData.count++;
        }
      } else {
        this.userEmailCounts.set(userEmail, { count: 1, resetTime: new Date(now.getTime() + 3600000) });
      }
    }

    return true;
  }

  /**
   * Apply test mode whitelist filtering
   */
  private applyTestModeFilter(recipients: string | string[]): string | string[] {
    const testMode = this.configService.get<boolean>('MAIL_TEST_MODE', false);
    
    if (!testMode) {
      return recipients;
    }

    const whitelist = this.configService.get<string>('MAIL_TEST_WHITELIST', '');
    const allowedEmails = whitelist.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

    if (allowedEmails.length === 0) {
      this.logger.warn('Test mode enabled but no whitelist configured');
      return [];
    }

    const filterEmail = (email: string): boolean => {
      const isAllowed = allowedEmails.includes(email.toLowerCase());
      if (!isAllowed) {
        this.logger.log(`Test mode: blocked email to ${email}`);
      }
      return isAllowed;
    };

    if (Array.isArray(recipients)) {
      return recipients.filter(filterEmail);
    } else {
      return filterEmail(recipients) ? recipients : '';
    }
  }

  /**
   * Add email to queue for background processing
   */
  async addToQueue(options: SendMailOptions): Promise<void> {
    const sendEnabled = this.configService.get<string>('MAIL_SEND_ENABLED', 'true') !== 'false';
    const useQueue = this.configService.get<string>('MAIL_USE_QUEUE', 'true') !== 'false';

    if (!sendEnabled) {
      this.logger.log(`Email sending disabled. Would send to: ${options.to}`);
      return;
    }

    // If queue is disabled, send immediately
    if (!useQueue) {
      this.logger.log(`Queue disabled, sending immediately: ${options.subject} -> ${options.to}`);
      return this.sendImmediately(options);
    }

    await this.mailQueue.add('send-mail', options, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.log(`Email queued: ${options.subject} -> ${options.to}`);
  }

  /**
   * Send email immediately (use sparingly)
   */
  async sendImmediately(options: SendMailOptions): Promise<void> {
    const sendEnabled = this.configService.get<boolean>('MAIL_SEND_ENABLED', true);
    
    if (!sendEnabled) {
      this.logger.log(`Email sending disabled. Would send to: ${options.to}`);
      return;
    }

    return this.processSendMail(options);
  }

  /**
   * Process and send email
   */
  async processSendMail(options: SendMailOptions): Promise<void> {
    try {
      // Apply test mode filter
      const filteredTo = this.applyTestModeFilter(options.to);
      
      if (!filteredTo || (Array.isArray(filteredTo) && filteredTo.length === 0)) {
        this.logger.warn('No valid recipients after whitelist filtering');
        return;
      }

      // Check rate limits for first recipient
      const firstRecipient = Array.isArray(filteredTo) ? filteredTo[0] : filteredTo;
      if (!this.checkRateLimits(firstRecipient)) {
        throw new Error('Rate limit exceeded');
      }

      // Get template
      const templateFn = this.templates.get(options.template);
      if (!templateFn) {
        throw new Error(`Template not found: ${options.template}`);
      }

      // Render body content
      const bodyContent = templateFn(options.context);

      // Wrap with base template
      const html = this.baseTemplate({
        subject: options.subject,
        body: bodyContent,
      });

      const fromEmail = this.configService.get<string>('MAIL_FROM', 'flightjobs.net.no.reply@gmail.com');
      const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'FlightJobs');

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: filteredTo,
        subject: `[FlightJobs] ${options.subject}`,
        html,
        priority: options.priority || 'normal',
      };

      if (options.attachments) {
        mailOptions.attachments = options.attachments;
      }

      const result = await this.transporter.sendMail(mailOptions);
      
      this.sentEmailsInHour++;
      this.logger.log(`Email sent: ${options.subject} -> ${filteredTo} (MessageId: ${result.messageId})`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${options.subject}`, error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    await this.addToQueue({
      to: data.userEmail,
      subject: 'Confirm your account',
      template: 'welcome',
      context: {
        userName: data.userName,
        userEmail: data.userEmail,
        confirmationLink: data.confirmationLink,
      },
      priority: 'high',
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: PasswordResetData): Promise<void> {
    await this.addToQueue({
      to: data.userEmail,
      subject: 'Reset your password',
      template: 'password-reset',
      context: {
        userName: data.userName,
        userEmail: data.userEmail,
        resetLink: data.resetLink,
        expiresIn: data.expiresIn,
      },
      priority: 'high',
    });
  }

  /**
   * Send license expiration warning
   */
  async sendLicenseWarningEmail(data: LicenseWarningData): Promise<void> {
    await this.addToQueue({
      to: data.userEmail,
      subject: 'Pilot license expiration warning',
      template: 'license-warning',
      context: {
        userName: data.userName,
        userEmail: data.userEmail,
        licenseCount: data.licenses.length,
        licenses: data.licenses,
      },
      priority: 'normal',
    });
  }

  /**
   * Send airline debt alert
   */
  async sendAirlineDebtEmail(data: AirlineDebtData): Promise<void> {
    await this.addToQueue({
      to: data.userEmail,
      subject: 'Airline has bills to pay',
      template: 'airline-debt',
      context: {
        userName: data.userName,
        userEmail: data.userEmail,
        airlineName: data.airlineName,
        debtValue: data.debtValue,
        debtMaturityDate: data.debtMaturityDate,
        jobDetails: data.jobDetails,
      },
      priority: 'normal',
    });
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): {
    sentInHour: number;
    globalLimit: number;
    userLimits: Record<string, { count: number; resetIn: number }>;
  } {
    const now = new Date();
    const userLimits: Record<string, { count: number; resetIn: number }> = {};

    this.userEmailCounts.forEach((data, email) => {
      userLimits[email] = {
        count: data.count,
        resetIn: Math.max(0, data.resetTime.getTime() - now.getTime()),
      };
    });

    return {
      sentInHour: this.sentEmailsInHour,
      globalLimit: this.configService.get<number>('MAIL_RATE_LIMIT_PER_HOUR', 100),
      userLimits,
    };
  }
}
