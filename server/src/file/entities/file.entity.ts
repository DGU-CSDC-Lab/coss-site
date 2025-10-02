import { Entity, Column, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities';

export enum OwnerType {
  POST = 'post',
  CUSTOM_TABLE = 'custom_table',
  SCHEDULE = 'schedule',
  POPUP = 'popup',
  FACULTY = 'faculty'
}

export enum FileStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  PENDING = 'pending'
}

@Entity('files')
export class File extends BaseEntity {
  @Column({ name: 'owner_type', type: 'enum', enum: OwnerType })
  ownerType: OwnerType;

  @Column({ name: 'owner_id', type: 'varchar' })
  ownerId: string;

  @Column({ name: 'file_key', type: 'varchar', length: 512 })
  fileKey: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255, nullable: true })
  originalName?: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 255, nullable: true })
  mimeType?: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true, default: null })
  fileSize?: number;

  @Column({ type: 'enum', enum: FileStatus, default: FileStatus.ACTIVE })
  status: FileStatus;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'created_by' })
  createdById: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
