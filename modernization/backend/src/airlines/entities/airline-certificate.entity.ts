import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('airlinecertificatesdbmodels')
export class AirlineCertificate {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @Column({ name: 'AirlineId', nullable: true })
  airlineId: number;

  @Column({ name: 'Name', nullable: true })
  name: string;

  @Column({ name: 'Description', nullable: true })
  description: string;

  @Column({ name: 'Cost', default: 0 })
  cost: number;
}
