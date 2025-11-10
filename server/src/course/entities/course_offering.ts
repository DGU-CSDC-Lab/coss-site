import { SoftDeleteEntity } from '@/common';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CourseMaster } from './course_master.entity';

@Entity('course_offerings')
export class CourseOffering extends SoftDeleteEntity {
  @ManyToOne(() => CourseMaster, master => master.offerings, { eager: false })
  @JoinColumn({ name: 'master_id' })
  master: CourseMaster;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 255 })
  semester: string;

  @Column({ name: 'class_time', type: 'varchar', nullable: true })
  classTime?: string;

  @Column({ type: 'varchar', nullable: true })
  instructor?: string;

  @Column({ type: 'varchar', nullable: true })
  classroom?: string;

  @Column({ name: 'syllabus_url', type: 'varchar', nullable: true })
  syllabusUrl?: string;
}
