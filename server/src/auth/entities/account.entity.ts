import { Entity, Column, OneToOne } from 'typeorm';
import { User } from '@/auth/entities/user.entity';
import { SoftDeleteEntity } from '@/common/entities';

@Entity('accounts')
export class Account extends SoftDeleteEntity {
  // account id 는 user entity에서 자동 생성됨
  // 이메일 (고유값)
  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  // 비밀번호 (해시값으로 저장)
  @Column({ name: 'password_hash', type: 'varchar', length: 100 })
  passwordHash: string;

  // 사용자와의 일대일 관계 설정 (역방향)
  @OneToOne(() => User, user => user.account)
  user: User;

  // 첫 로그인 여부
  @Column({ name: 'is_first_login', type: 'boolean', default: true })
  isFirstLogin: boolean;
}
