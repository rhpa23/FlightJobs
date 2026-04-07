import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { DistanceCalculatorService } from './services/distance-calculator.service';
import { PaymentCalculatorService } from './services/payment-calculator.service';
import { Statistics } from '../statistics/entities/statistics.entity';
import { User } from '../users/entities/user.entity';
import { PilotLicenseExpenseUser } from '../licenses/entities/pilot-license-expense-user.entity';
import { Airline } from '../airlines/entities/airline.entity';
import { AirlineFbo } from '../airlines/entities/airline-fbo.entity';
import { JobAirline } from '../job-airlines/entities/job-airline.entity';
import { NavdataModule } from '../navdata/navdata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      Statistics,
      User,
      PilotLicenseExpenseUser,
      Airline,
      AirlineFbo,
      JobAirline
    ]),
    NavdataModule
  ],
  providers: [
    JobsService, 
    DistanceCalculatorService, 
    PaymentCalculatorService
  ],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
