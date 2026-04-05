import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Statistics } from '../../statistics/entities/statistics.entity';
import { Job } from '../../jobs/entities/job.entity';
import { AirlineCertificate } from './airline-certificate.entity';
import { AirlineFbo } from './airline-fbo.entity';

@Entity('airlines')
export class Airline {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  country: string;

  @Column({ default: 20 })
  salary: number;

  @Column({ default: 0 })
  score: number;

  @Column({ name: 'airline_score', default: 0 })
  airlineScore: number;

  @Column({ nullable: true })
  logo: string;

  @Column({ name: 'bank_balance', default: 0 })
  bankBalance: number;

  @Column({ name: 'debt_value', default: 0 })
  debtValue: number;

  @Column({ name: 'debt_maturity_date', type: 'datetime', nullable: true })
  debtMaturityDate: Date;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  owner: User;

  @OneToMany(() => Statistics, statistics => statistics.airline)
  pilots: Statistics[];

  @OneToMany(() => Job, job => job.airline)
  jobs: Job[];

  @OneToMany(() => AirlineCertificate, cert => cert.airline)
  certificates: AirlineCertificate[];

  @OneToMany(() => AirlineFbo, fbo => fbo.airline)
  fbos: AirlineFbo[];

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
