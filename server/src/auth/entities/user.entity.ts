import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { Account } from '@/auth/entities/account.entity';
import { SoftDeleteEntity } from '@/common/entities';

// 사용자 역할 enum
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('users')
export class User extends SoftDeleteEntity {
  @Column({ name: 'username', type: 'varchar', length: 255 })
  username: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id' }) // Account entity에 account id를 자동 생성함.
  account: Account;
}
