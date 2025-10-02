import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities';
import { BoardPost } from './board-post.entity';

@Entity('post_files')
export class PostFile extends BaseEntity {
  @Column({ name: 'post_id' })
  postId: string;

  @Column({ name: 'file_key' })
  fileKey: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize?: number;

  @Column({ name: 'mime_type', nullable: true })
  mimeType?: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @ManyToOne(() => BoardPost, post => post.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: BoardPost;
}
