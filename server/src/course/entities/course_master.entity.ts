import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities';
import { CourseOffering } from './course_offering';

@Entity('courses_masters')
export class CourseMaster extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  semester: string;

  @Column({ type: 'varchar', length: 255 })
  department: string;

  @Column({ name: 'course_code', type: 'varchar', length: 255 })
  courseCode: string;

  @Column({ name: 'subject_name', type: 'varchar', length: 255 })
  subjectName: string;

  @Column({ name: 'english_name', type: 'varchar', nullable: true })
  englishName: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  grade: string;

  @Column({ type: 'float', nullable: true })
  credit: number;

  @Column({ name: 'course_type', type: 'varchar', nullable: true })
  courseType: string;

  @OneToMany(() => CourseOffering, (offering) => offering.master)
  offerings: CourseOffering[];
}
