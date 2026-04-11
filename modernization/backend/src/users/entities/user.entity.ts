import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { Airline } from '../../airlines/entities/airline.entity';

@Entity('aspnetusers')
export class User {
  @PrimaryColumn({ name: 'Id', type: 'varchar' })
  id: string;

  @Column({ name: 'Email', unique: true })
  email: string;

  @Column({ name: 'PasswordHash', nullable: true })
  passwordHash: string;

  @Column({ name: 'UserName', nullable: true })
  userName: string;

  @Column({ name: 'SecurityStamp', nullable: true })
  securityStamp: string;

  @Column({ name: 'PhoneNumber', nullable: true })
  phoneNumber: string;

  @Column({ name: 'PhoneNumberConfirmed', type: 'boolean', default: false })
  phoneNumberConfirmed: boolean;

  @Column({ name: 'TwoFactorEnabled', type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'LockoutEndDateUtc', type: 'datetime', nullable: true })
  lockoutEnd: Date;

  @Column({ name: 'LockoutEnabled', type: 'boolean', default: true })
  lockoutEnabled: boolean;

  @Column({ name: 'AccessFailedCount', default: 0 })
  accessFailedCount: number;

  @Column({ name: 'EmailConfirmed', type: 'boolean', default: false })
  emailConfirmed: boolean;

  @OneToMany(() => Job, job => job.user)
  jobs: Job[];

  @OneToMany(() => Airline, airline => airline.owner)
  airlines: Airline[];
}
