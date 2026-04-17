import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airline } from './entities/airline.entity';
import { AirlineCertificate } from './entities/airline-certificate.entity';
import { AirlineFbo } from './entities/airline-fbo.entity';
import { Statistics } from '../statistics/entities/statistics.entity';
import { User } from '../users/entities/user.entity';
import { Job } from '../jobs/entities/job.entity';
import { AirlinesService } from './airlines.service';
import { AirlinesController } from './airlines.controller';
import { NavdataModule } from '../navdata/navdata.module';

@Module({
  imports: [TypeOrmModule.forFeature([Airline, AirlineCertificate, AirlineFbo, Statistics, User, Job]), NavdataModule],
  providers: [AirlinesService],
  controllers: [AirlinesController],
  exports: [AirlinesService, TypeOrmModule],
})
export class AirlinesModule {}
