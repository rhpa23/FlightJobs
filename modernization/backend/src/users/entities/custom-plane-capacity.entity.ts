import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('custom_plane_capacity')
export class CustomPlaneCapacity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'plane_name' })
  planeName: string;

  @Column({ name: 'pax_capacity' })
  paxCapacity: number;

  @Column({ name: 'cargo_capacity' })
  cargoCapacity: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
