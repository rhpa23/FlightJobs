import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('airlinefbodbmodels')
export class AirlineFbo {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'AirlineId', nullable: true })
  airlineId: number;

  @Column({ name: 'Icao', length: 4, nullable: true })
  icao: string;

  @Column({ name: 'ContractDate', type: 'datetime', nullable: true })
  contractDate: Date;
}
