import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities';

@Entity('histories')
export class History extends SoftDeleteEntity {
  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;
}
