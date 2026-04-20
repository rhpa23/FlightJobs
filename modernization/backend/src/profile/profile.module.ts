import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Job } from '../jobs/entities/job.entity';
import { JobAirline } from '../job-airlines/entities/job-airline.entity';
import { PilotLicenseExpense } from '../licenses/entities/pilot-license-expense.entity';
import { PilotLicenseExpenseUser } from '../licenses/entities/pilot-license-expense-user.entity';
import { PilotLicenseItem } from '../licenses/entities/pilot-license-item.entity';
import { LicenseItemUser } from '../licenses/entities/license-item-user.entity';
import { User } from '../users/entities/user.entity';
import { Statistics } from '../statistics/entities/statistics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      JobAirline,
      PilotLicenseExpense,
      PilotLicenseExpenseUser,
      PilotLicenseItem,
      LicenseItemUser,
      User,
      Statistics,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
