import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Airline } from '../../airlines/entities/airline.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'departure_icao', length: 4 })
  departureICAO: string;

  @Column({ name: 'arrival_icao', length: 4 })
  arrivalICAO: string;

  @Column({ name: 'alternative_icao', length: 4, nullable: true })
  alternativeICAO: string;

  @Column({ default: 0 })
  distance: number;

  @Column({ default: 0 })
  pax: number;

  @Column({ default: 0 })
  cargo: number;

  @Column({ default: 0 })
  pay: number;

  @Column({ name: 'first_class', default: 0 })
  firstClass: number;

  @Column({ name: 'is_done', default: 0 })
  isDone: boolean;

  @Column({ name: 'is_activated', default: 0 })
  isActivated: boolean;

  @Column({ name: 'in_progress', default: 0 })
  inProgress: boolean;

  @Column({ name: 'is_challenge', default: 0 })
  isChallenge: boolean;

  @Column({ name: 'challenge_type', nullable: true })
  challengeType: string;

  @Column({ name: 'challenge_creator_user_id', nullable: true })
  challengeCreatorUserId: string;

  @Column({ name: 'challenge_expiration_date', type: 'datetime', nullable: true })
  challengeExpirationDate: Date;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ name: 'model_name', nullable: true })
  modelName: string;

  @Column({ name: 'model_description', nullable: true })
  modelDescription: string;

  @Column({ name: 'aviation_type', default: 1 })
  aviationType: number;

  @Column({ name: 'start_fuel_weight', nullable: true })
  startFuelWeight: number;

  @Column({ name: 'finish_fuel_weight', nullable: true })
  finishFuelWeight: number;

  @Column({ name: 'used_fuel_weight', nullable: true })
  usedFuelWeight: number;

  @Column({ name: 'weight_unit', nullable: true })
  weightUnit: string;

  @Column({ name: 'payload', nullable: true })
  payload: number;

  @Column({ name: 'payload_pax', nullable: true })
  payloadPax: number;

  @Column({ name: 'pax_weight', default: 84 })
  paxWeight: number;

  @Column({ name: 'video_url', nullable: true })
  videoUrl: string;

  @Column({ name: 'video_description', nullable: true })
  videoDescription: string;

  @Column({ name: 'payload_display', nullable: true })
  payloadDisplay: string;

  @ManyToOne(() => User, user => user.jobs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Airline, airline => airline.jobs, { nullable: true })
  @JoinColumn({ name: 'airline_id' })
  airline: Airline;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
