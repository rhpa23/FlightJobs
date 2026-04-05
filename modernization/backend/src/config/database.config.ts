import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: process.env.DATABASE_PATH || path.join(__dirname, '../../../FlightJobs/App_Data/FlightJobsLite.db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Desabilitado para preservar dados existentes
  logging: process.env.NODE_ENV === 'development',
};
