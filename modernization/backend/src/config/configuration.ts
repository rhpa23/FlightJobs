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
}));
