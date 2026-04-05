import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Airline } from '../../airlines/entities/airline.entity';
import { CustomPlaneCapacity } from '../../users/entities/custom-plane-capacity.entity';

@Entity('statistics')
export class Statistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'bank_balance', default: 0 })
  bankBalance: number;

  @Column({ name: 'pilot_score', default: 0 })
  pilotScore: number;

  @Column({ name: 'number_flights', default: 0 })
  numberFlights: number;

  @Column({ name: 'flight_time_total', type: 'decimal', precision: 10, scale: 2, default: 0 })
  flightTimeTotal: number;

  @Column({ name: 'payload_total', type: 'decimal', precision: 10, scale: 2, default: 0 })
  payloadTotal: number;

  @Column({ name: 'last_flight', type: 'datetime', nullable: true })
  lastFlight: Date;

  @Column({ name: 'last_aircraft', nullable: true })
  lastAircraft: string;

  @Column({ name: 'favorite_airplane', nullable: true })
  favoriteAirplane: string;

  @Column({ name: 'weight_unit', default: 'kg' })
  weightUnit: string;

  @Column({ name: 'license_warning_sent', default: 0 })
  licenseWarningSent: boolean;

  @Column({ name: 'send_license_warning', default: 1 })
  sendLicenseWarning: boolean;

  @Column({ name: 'airline_bills_warning_sent', default: 0 })
  airlineBillsWarningSent: boolean;

  @Column({ name: 'send_airline_bills_warning', default: 1 })
  sendAirlineBillsWarning: boolean;

  @Column({ name: 'logo', nullable: true })
  logo: string;

  @OneToOne(() => User, user => user.statistics)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Airline, airline => airline.pilots, { nullable: true })
  @JoinColumn({ name: 'airline_id' })
  airline: Airline;

  @OneToOne(() => CustomPlaneCapacity, { nullable: true })
  @JoinColumn({ name: 'custom_plane_capacity_id' })
  customPlaneCapacity: CustomPlaneCapacity;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
