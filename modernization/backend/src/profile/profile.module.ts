import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Job } from '../jobs/entities/job.entity';
import { PilotLicenseExpense } from '../licenses/entities/pilot-license-expense.entity';
import { PilotLicenseExpenseUser } from '../licenses/entities/pilot-license-expense-user.entity';
import { PilotLicenseItem } from '../licenses/entities/pilot-license-item.entity';
import { LicenseItemUser } from '../licenses/entities/license-item-user.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      PilotLicenseExpense,
      PilotLicenseExpenseUser,
      PilotLicenseItem,
      LicenseItemUser,
      User,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
