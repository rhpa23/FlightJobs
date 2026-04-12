import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('customplanecapacitydbmodels')
export class CustomPlaneCapacity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'User_Id' })
  user: User;

  @Column({ name: 'User_Id' })
  userId: string;

  @Column({ name: 'CustomNameCapacity' })
  planeName: string;

  @Column({ name: 'CustomPassengerCapacity' })
  paxCapacity: number;

  @Column({ name: 'CustomCargoCapacityWeight' })
  cargoCapacity: number;

  @Column({ name: 'CustomPaxWeight', default: 84 })
  paxWeight: number;

  @Column({ name: 'ImagePath', nullable: true })
  imageUrl: string;
}
