import { registerAs } from '@nestjs/config';
import * as path from 'path';

export default registerAs('configuration', () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    path: process.env.DATABASE_PATH || path.join(__dirname, '../../../FlightJobs/App_Data/FlightJobsLite.db'),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || 'flightjobs.net.no.reply@gmail.com',
    fromName: process.env.MAIL_FROM_NAME || 'FlightJobs',
    secure: process.env.MAIL_SECURE === 'true',
  },
  
  mailSecurity: {
    sendEnabled: process.env.MAIL_SEND_ENABLED !== 'false',
    rateLimitPerHour: parseInt(process.env.MAIL_RATE_LIMIT_PER_HOUR || '100', 10),
    maxRecipientsPerBatch: parseInt(process.env.MAIL_MAX_RECIPIENTS_PER_BATCH || '50', 10),
    testMode: process.env.MAIL_TEST_MODE === 'true',
    testWhitelist: (process.env.MAIL_TEST_WHITELIST || '').split(',').map(e => e.trim()).filter(Boolean),
    throttleMs: parseInt(process.env.MAIL_THROTTLE_MS || '5000', 10),
    useQueue: process.env.MAIL_USE_QUEUE !== 'false',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
}));
