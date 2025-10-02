import { Entity, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { SoftDeleteEntity } from '../../common/entities';

@Entity('accounts')
export class Account extends SoftDeleteEntity {
  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @OneToMany(() => User, user => user.account)
  users: User[];
}
