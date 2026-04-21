export interface MailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
  secure: boolean;
}

export interface MailSecurityConfig {
  sendEnabled: boolean;
  rateLimitPerHour: number;
  maxRecipientsPerBatch: number;
  testMode: boolean;
  testWhitelist: string[];
  throttleMs: number;
}

export interface MailQueueConfig {
  redisHost: string;
  redisPort: number;
  concurrency: number;
  attempts: number;
  backoffDelay: number;
}
