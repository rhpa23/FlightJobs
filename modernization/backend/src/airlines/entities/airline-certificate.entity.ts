import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Airline } from './airline.entity';

@Entity('airline_certificates')
export class AirlineCertificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'airline_id' })
  airlineId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  cost: number;

  @ManyToOne(() => Airline, airline => airline.certificates)
  @JoinColumn({ name: 'airline_id' })
  airline: Airline;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
