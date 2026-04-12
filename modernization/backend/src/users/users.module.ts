import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CustomPlaneCapacity } from './entities/custom-plane-capacity.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CustomCapacityService } from './custom-capacity.service';
import { CustomCapacityController } from './custom-capacity.controller';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CustomPlaneCapacity]),
    forwardRef(() => StatisticsModule),
  ],
  providers: [UsersService, CustomCapacityService],
  controllers: [UsersController, CustomCapacityController],
  exports: [UsersService, CustomCapacityService, TypeOrmModule],
})
export class UsersModule {}
