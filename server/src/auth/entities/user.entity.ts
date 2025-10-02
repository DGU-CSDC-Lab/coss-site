import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';
import { SoftDeleteEntity } from '../../common/entities';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

@Entity('users')
export class User extends SoftDeleteEntity {
  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ManyToOne(() => Account, account => account.users)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
