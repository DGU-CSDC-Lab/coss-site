import { BaseEntity } from '@/common';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CourseMaster } from './course_master.entity';

@Entity('course_offerings')
export class CourseOffering extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  id: string;

  @ManyToOne(() => CourseMaster, master => master.offerings, { eager: false })
  @JoinColumn({ name: 'master_id' })
  master: CourseMaster;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 255 })
  semester: string;

  @Column({ type: 'varchar', nullable: true })
  classTime?: string;

  @Column({ type: 'varchar', nullable: true })
  instructor?: string;

  @Column({ type: 'varchar', nullable: true })
  classroom?: string;

  @Column({ name: 'syllabus_url', type: 'varchar', nullable: true })
  syllabusUrl?: string;
}
