import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities';

@Entity('histories')
export class History extends BaseEntity {
  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  event: string;
}
