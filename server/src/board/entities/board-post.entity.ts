import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../common/entities';
import { User } from '../../auth/entities';
import { Category } from '../../category/entities';
import { PostFile } from './post-file.entity';

export enum PostStatus {
  DRAFT = 'draft',      // 임시저장
  PRIVATE = 'private',  // 비공개
  PUBLIC = 'public',    // 공개
}

@Entity('board_posts')
export class BoardPost extends SoftDeleteEntity {
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PUBLIC,
  })
  status: PostStatus;

  @OneToMany(() => PostFile, file => file.post, { cascade: true })
  files: PostFile[];
}
