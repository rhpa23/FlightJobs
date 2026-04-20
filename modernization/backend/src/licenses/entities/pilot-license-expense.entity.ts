import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pilotlicenseexpensesdbmodels')
export class PilotLicenseExpense {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'Name' })
  name: string;

  @Column({ name: 'DaysMaturity', type: 'int' })
  daysMaturity: number;

  @Column({ name: 'Mandatory', default: false })
  mandatory: boolean;
}
