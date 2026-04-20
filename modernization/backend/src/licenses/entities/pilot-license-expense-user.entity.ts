import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PilotLicenseExpense } from './pilot-license-expense.entity';

@Entity('pilotlicenseexpensesuserdbmodels')
export class PilotLicenseExpenseUser {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'User_Id' })
  user: User;

  @ManyToOne(() => PilotLicenseExpense)
  @JoinColumn({ name: 'PilotLicenseExpense_Id' })
  pilotLicenseExpense: PilotLicenseExpense;

  @Column({ name: 'MaturityDate', type: 'datetime' })
  maturityDate: Date;

  @Column({ name: 'OverdueProcessed', default: false })
  overdueProcessed: boolean;

  @Column({ name: 'OverdueProcessed_old', nullable: true, default: false })
  overdueProcessedOld: boolean;
}
