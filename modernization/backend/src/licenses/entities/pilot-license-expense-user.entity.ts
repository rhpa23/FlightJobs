import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pilotlicenseexpensesuserdbmodels')
export class PilotLicenseExpenseUser {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'User_Id' })
  user: User;

  @Column({ name: 'MaturityDate', type: 'datetime' })
  maturityDate: Date;

  @Column({ name: 'OverdueProcessed', default: false })
  overdueProcessed: boolean;
}
