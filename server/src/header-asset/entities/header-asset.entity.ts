import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities';

@Entity('header_assets')
export class HeaderAsset extends SoftDeleteEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({ name: 'link_url', type: 'varchar', length: 500 })
  linkUrl: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by' })
  createdById: string;
}
