import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities';

export enum OwnerType {
  POST = 'post',
}

export enum FileStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  PENDING = 'pending',
}

@Entity('files')
export class File extends SoftDeleteEntity {
  @Column({ name: 'owner_type', type: 'enum', enum: OwnerType })
  ownerType: OwnerType;

  @Column({ name: 'owner_id', type: 'varchar', length: 255 })
  ownerId: string;

  @Column({ name: 'file_key', type: 'varchar', length: 512 })
  fileKey: string; // s3 object key

  @Column({
    name: 'file_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  fileName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'display_order', type: 'int', nullable: true })
  displayOrder?: number;

  @Column({ type: 'enum', enum: FileStatus, default: FileStatus.ACTIVE })
  status: FileStatus;

  @Column({ name: 'created_by' })
  createdById: string;
}
