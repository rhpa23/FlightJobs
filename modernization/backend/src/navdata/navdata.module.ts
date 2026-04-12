import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavdataService } from './navdata.service';
import { NavdataController } from './navdata.controller';
import { Job } from '../jobs/entities/job.entity';
import { User } from '../users/entities/user.entity';
import { Statistics } from '../statistics/entities/statistics.entity';
import { CustomPlaneCapacity } from '../users/entities/custom-plane-capacity.entity';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, User, Statistics, CustomPlaneCapacity]),
    forwardRef(() => JobsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [NavdataController],
  providers: [NavdataService],
  exports: [NavdataService],
})
export class NavdataModule {}
