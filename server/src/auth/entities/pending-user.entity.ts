import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities';

@Entity('pending_users')
export class PendingUser extends SoftDeleteEntity {
  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 100 })
  passwordHash: string;

  @Column({ name: 'verification_code', type: 'varchar', length: 6 })
  verificationCode: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;
}
