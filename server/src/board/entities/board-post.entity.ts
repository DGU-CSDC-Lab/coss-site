import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from '../../common/entities';
import { User } from '../../auth/entities';
import { Category } from '../../category/entities';
import { PostFile } from './post-file.entity';

@Entity('board_posts')
export class BoardPost extends SoftDeleteEntity {
  @Column({ name: 'category_id' })
  categoryId: string;

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

  @OneToMany(() => PostFile, file => file.post, { cascade: true })
  files: PostFile[];
}
