import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Statistics } from './entities/statistics.entity';
import { CustomPlaneCapacity } from '../users/entities/custom-plane-capacity.entity';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Statistics, CustomPlaneCapacity])],
  providers: [StatisticsService],
  controllers: [StatisticsController],
  exports: [StatisticsService, TypeOrmModule],
})
export class StatisticsModule {}
