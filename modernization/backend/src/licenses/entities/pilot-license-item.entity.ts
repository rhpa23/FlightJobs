import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PilotLicenseExpense } from './pilot-license-expense.entity';

@Entity('pilotlicenseitemdbmodels')
export class PilotLicenseItem {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'Name' })
  name: string;

  @Column({ name: 'Price' })
  price: number;

  @Column({ name: 'Image', nullable: true })
  image: string;

  @ManyToOne(() => PilotLicenseExpense)
  @JoinColumn({ name: 'PilotLicenseExpense_Id' })
  pilotLicenseExpense: PilotLicenseExpense;
}
