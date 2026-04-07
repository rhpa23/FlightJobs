import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobAirline } from './entities/job-airline.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobAirline])],
  exports: [TypeOrmModule],
})
export class JobAirlinesModule {}
