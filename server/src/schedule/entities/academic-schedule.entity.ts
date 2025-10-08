import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '../../common/entities';

export enum ScheduleCategory {
  ACADEMIC = 'academic',
  ADMISSION = 'admission',
  EVENT = 'event',
}

@Entity('academic_schedules')
export class AcademicSchedule extends SoftDeleteEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({
    type: 'enum',
    enum: ScheduleCategory,
    default: ScheduleCategory.ACADEMIC,
  })
  category: ScheduleCategory;

  @Column({ name: 'created_by' })
  createdById: string;
}
