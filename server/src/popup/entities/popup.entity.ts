import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '../../common/entities';

@Entity('popups')
export class Popup extends SoftDeleteEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  @Column({ name: 'link_url', type: 'varchar', nullable: true })
  linkUrl?: string;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'start_date', type: 'datetime' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime' })
  endDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by' })
  createdById: string;
}
