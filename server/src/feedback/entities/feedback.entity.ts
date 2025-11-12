import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities';
import { User } from '@/auth/entities';

export enum FeedbackType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  IMPROVEMENT = 'IMPROVEMENT',
  OTHER = 'OTHER',
}

export enum FeedbackStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity('feedbacks')
export class Feedback extends SoftDeleteEntity {
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'type', type: 'enum', enum: FeedbackType })
  type: FeedbackType;

  @Column({ name: 'status', type: 'enum', enum: FeedbackStatus, default: FeedbackStatus.PENDING })
  status: FeedbackStatus;

  @Column({ name: 'image_urls', type: 'json', nullable: true })
  imageUrls?: string[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;
}
