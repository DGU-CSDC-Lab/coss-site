import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CustomTable } from './custom-table.entity';
import { BaseEntity } from '../../common/entities';

export enum ColumnType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  JSON = 'json'
}

@Entity('custom_table_columns')
export class CustomTableColumn extends BaseEntity {
  @Column({ name: 'table_id' })
  tableId: string;

  @Column({ name: 'column_name', type: 'varchar', length: 255 })
  columnName: string;

  @Column({ name: 'column_type', type: 'enum', enum: ColumnType })
  columnType: ColumnType;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @ManyToOne(() => CustomTable, table => table.columns)
  @JoinColumn({ name: 'table_id' })
  table: CustomTable;
}
