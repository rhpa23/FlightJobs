import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Airline } from '../../airlines/entities/airline.entity';
import { User } from '../../users/entities/user.entity';
import { CustomPlaneCapacity } from '../../users/entities/custom-plane-capacity.entity';

@Entity('statisticsdbmodels')
export class Statistics {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'User_Id' })
  user: User;

  @Column({ name: 'BankBalance', default: 0 })
  bankBalance: number;

  @Column({ name: 'PilotScore', default: 0 })
  pilotScore: number;

  @Column({ name: 'Logo', nullable: true })
  logo: string;

  @Column({ name: 'SendLicenseWarning', type: 'boolean', default: false })
  sendLicenseWarning: boolean;

  @Column({ name: 'SendAirlineBillsWarning', type: 'boolean', default: false })
  sendAirlineBillsWarning: boolean;

  @Column({ name: 'LicenseWarningSent', type: 'boolean', default: false })
  licenseWarningSent: boolean;

  @Column({ name: 'AirlineBillsWarningSent', type: 'boolean', default: false })
  airlineBillsWarningSent: boolean;

  @Column({ name: 'UseCustomPlaneCapacity', type: 'boolean', default: false })
  useCustomPlaneCapacity: boolean;

  @Column({ name: 'WeightUnit', nullable: true })
  weightUnit: string;

  @ManyToOne(() => Airline, { nullable: true })
  @JoinColumn({ name: 'Airline_Id' })
  airline: Airline;

  @ManyToOne(() => CustomPlaneCapacity, { nullable: true })
  @JoinColumn({ name: 'CustomPlaneCapacity_Id' })
  customPlaneCapacity: CustomPlaneCapacity;

  @Column({ name: 'CustomPlaneCapacity_Id', nullable: true })
  customPlaneCapacityId: number;

  @Column({ name: 'User_Id', nullable: true })
  userId: string;
}
