import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('jobdbmodels')
export class Job {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'PaxWeight', default: 84 })
  paxWeight: number;

  @Column({ name: 'DepartureICAO', length: 4, nullable: true })
  departureICAO: string;

  @Column({ name: 'ArrivalICAO', length: 4, nullable: true })
  arrivalICAO: string;

  @Column({ name: 'AlternativeICAO', length: 4, nullable: true })
  alternativeICAO: string;

  @Column({ name: 'Dist', default: 0 })
  distance: number;

  @Column({ name: 'Pax', default: 0 })
  pax: number;

  @Column({ name: 'Cargo', default: 0 })
  cargo: number;

  @Column({ name: 'Pay', default: 0 })
  pay: number;

  @Column({ name: 'FirstClass', type: 'simple-enum', default: 0 })
  firstClass: number;

  @Column({ name: 'IsDone', type: 'simple-enum', default: 0 })
  isDone: boolean;

  @Column({ name: 'IsActivated', type: 'simple-enum', default: 0 })
  isActivated: boolean;

  @Column({ name: 'InProgress', type: 'simple-enum', default: 0 })
  inProgress: boolean;

  @Column({ name: 'StartTime', type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ name: 'EndTime', type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ name: 'ModelName', nullable: true })
  modelName: string;

  @Column({ name: 'ModelDescription', nullable: true })
  modelDescription: string;

  @Column({ name: 'StartFuelWeight', default: 0 })
  startFuelWeight: number;

  @Column({ name: 'FinishFuelWeight', default: 0 })
  finishFuelWeight: number;

  @Column({ name: 'AviationType', default: 1 })
  aviationType: number;

  @Column({ name: 'VideoUrl', nullable: true })
  videoUrl: string;

  @Column({ name: 'VideoDescription', nullable: true })
  videoDescription: string;

  @Column({ name: 'ChallengeCreatorUserId', nullable: true })
  challengeCreatorUserId: string;

  @Column({ name: 'IsChallenge', type: 'simple-enum', default: 0 })
  isChallenge: boolean;

  @Column({ name: 'ChallengeExpirationDate', type: 'datetime', nullable: true })
  challengeExpirationDate: Date;

  @Column({ name: 'ChallengeType', default: 0 })
  challengeType: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'User_Id' })
  user: User;

  @Column({ name: 'PilotScore', default: 0 })
  pilotScore: number;
}
