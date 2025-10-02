import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '../../common/entities';

export enum HeaderAssetType {
  LOGO = 'logo',
  BANNER = 'banner',
  BACKGROUND = 'background',
  ANNOUNCEMENT = 'announcement'
}

@Entity('header_assets')
export class HeaderAsset extends SoftDeleteEntity {
  @Column({ type: 'enum', enum: HeaderAssetType })
  type: HeaderAssetType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ name: 'link_url', type: 'varchar', length: 500, nullable: true })
  linkUrl?: string;

  @Column({ name: 'text_content', type: 'text', nullable: true })
  textContent?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'start_date', type: 'datetime', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'datetime', nullable: true })
  endDate?: Date;

  @Column({ name: 'created_by' })
  createdById: string;
}
