import { Entity, Column, OneToMany } from 'typeorm';
import { CustomTableColumn } from './custom-table-column.entity';
import { CustomTableRow } from './custom-table-row.entity';
import { SoftDeleteEntity } from '../../common/entities';

@Entity('custom_tables')
export class CustomTable extends SoftDeleteEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ name: 'created_by' })
  createdById: string;

  @OneToMany(() => CustomTableColumn, column => column.table, { cascade: true })
  columns: CustomTableColumn[];

  @OneToMany(() => CustomTableRow, row => row.table, { cascade: true })
  rows: CustomTableRow[];
}
