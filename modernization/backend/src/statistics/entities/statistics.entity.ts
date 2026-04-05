import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Airline } from '../../airlines/entities/airline.entity';

@Entity('statisticsdbmodels')
export class Statistics {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'BankBalance', default: 0 })
  bankBalance: number;

  @Column({ name: 'PilotScore', default: 0 })
  pilotScore: number;

  @Column({ name: 'Logo', nullable: true })
  logo: string;

  @Column({ name: 'SendLicenseWarning', default: 0 })
  sendLicenseWarning: boolean;

  @Column({ name: 'SendAirlineBillsWarning', default: 0 })
  sendAirlineBillsWarning: boolean;

  @Column({ name: 'LicenseWarningSent', default: 0 })
  licenseWarningSent: boolean;

  @Column({ name: 'AirlineBillsWarningSent', default: 0 })
  airlineBillsWarningSent: boolean;

  @Column({ name: 'UseCustomPlaneCapacity', default: 0 })
  useCustomPlaneCapacity: boolean;

  @Column({ name: 'WeightUnit', nullable: true })
  weightUnit: string;

  @ManyToOne(() => Airline, { nullable: true })
  @JoinColumn({ name: 'Airline_Id' })
  airline: Airline;

  @Column({ name: 'CustomPlaneCapacity_Id', nullable: true })
  customPlaneCapacityId: number;

  @Column({ name: 'User_Id', nullable: true })
  userId: string;
}
