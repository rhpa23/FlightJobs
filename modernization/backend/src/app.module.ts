import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app-simple.service';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { AirlinesModule } from './airlines/airlines.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ChallengesModule } from './challenges/challenges.module';
import { NavdataModule } from './navdata/navdata.module';
import { LicensesModule } from './licenses/licenses.module';
import { JobAirlinesModule } from './job-airlines/job-airlines.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get('configuration.database.path') ||
          path.join(__dirname, '../../FlightJobs/App_Data/FlightJobsLite.db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Desabilitado para preservar dados existentes
        logging: false, // Desabilitado para melhor performance
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    JobsModule,
    AirlinesModule,
    StatisticsModule,
    ChallengesModule,
    NavdataModule,
    LicensesModule,
    JobAirlinesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
