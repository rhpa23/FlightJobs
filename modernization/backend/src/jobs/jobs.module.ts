import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { DistanceCalculatorService } from './services/distance-calculator.service';
import { PaymentCalculatorService } from './services/payment-calculator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  providers: [JobsService, DistanceCalculatorService, PaymentCalculatorService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
