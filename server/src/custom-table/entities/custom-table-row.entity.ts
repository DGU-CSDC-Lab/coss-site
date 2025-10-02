import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomTable } from './custom-table.entity';
import { SoftDeleteEntity } from '../../common/entities';

@Entity('custom_table_rows')
export class CustomTableRow extends SoftDeleteEntity {
  @Column({ name: 'table_id' })
  tableId: string;

  @Column({ type: 'json' })
  data: Record<string, any>;

  @Column({ name: 'created_by' })
  createdById: string;

  @ManyToOne(() => CustomTable, table => table.rows)
  @JoinColumn({ name: 'table_id' })
  table: CustomTable;
}
