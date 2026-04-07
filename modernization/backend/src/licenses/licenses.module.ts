import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PilotLicenseExpenseUser } from './entities/pilot-license-expense-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PilotLicenseExpenseUser])],
  exports: [TypeOrmModule],
})
export class LicensesModule {}