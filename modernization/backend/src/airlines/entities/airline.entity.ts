import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('airlinedbmodels')
export class Airline {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'Name', nullable: true })
  name: string;

  @Column({ name: 'Description', nullable: true })
  description: string;

  @Column({ name: 'Country', nullable: true })
  country: string;

  @Column({ name: 'Salary', default: 20 })
  salary: number;

  @Column({ name: 'Score', default: 0 })
  score: number;

  @Column({ name: 'Logo', nullable: true })
  logo: string;

  @Column({ name: 'BankBalance', default: 0 })
  bankBalance: number;

  @Column({ name: 'AirlineScore', default: 0 })
  airlineScore: number;

  @Column({ name: 'UserId', nullable: true })
  userId: string;

  @Column({ name: 'DebtValue', default: 0 })
  debtValue: number;

  @Column({ name: 'DebtMaturityDate', type: 'datetime', nullable: true })
  debtMaturityDate: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'UserId' })
  owner: User;
}
