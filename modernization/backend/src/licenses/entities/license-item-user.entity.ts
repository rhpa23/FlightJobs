import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PilotLicenseItem } from './pilot-license-item.entity';

@Entity('licenseitemuserdbmodels')
export class LicenseItemUser {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'User_Id' })
  user: User;

  @ManyToOne(() => PilotLicenseItem)
  @JoinColumn({ name: 'PilotLicenseItem_Id' })
  pilotLicenseItem: PilotLicenseItem;

  @Column({ name: 'IsBought', default: false })
  isBought: boolean;
}
