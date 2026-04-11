import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Airline } from './airline.entity';

@Entity('airlinefbodbmodels')
export class AirlineFbo {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'Icao', length: 4, nullable: true })
  icao: string;

  @ManyToOne(() => Airline)
  @JoinColumn({ name: 'Airline_Id' })
  airline: Airline;

  @Column({ name: 'Availability', default: 0 })
  availability: number;

  @Column({ name: 'ScoreIncrease', default: 0 })
  scoreIncrease: number;

  @Column({ name: 'FuelPriceDiscount', type: 'float', default: 0 })
  fuelPriceDiscount: number;

  @Column({ name: 'GroundCrewDiscount', type: 'float', default: 0 })
  groundCrewDiscount: number;

  @Column({ name: 'Price', default: 0 })
  price: number;
}
