import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Airline } from './airline.entity';

@Entity('airline_fbo')
export class AirlineFbo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'airline_id' })
  airlineId: number;

  @Column({ name: 'icao', length: 4 })
  icao: string;

  @Column({ name: 'contract_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  contractDate: Date;

  @ManyToOne(() => Airline, airline => airline.fbos)
  @JoinColumn({ name: 'airline_id' })
  airline: Airline;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
