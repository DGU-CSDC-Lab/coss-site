import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities';

@Entity('courses')
export class Course extends BaseEntity {
  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 255 })
  semester: string;

  @Column({ type: 'varchar', length: 255 })
  department: string;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'english_name', type: 'varchar', nullable: true })
  englishName?: string;

  @Column({ type: 'varchar', nullable: true })
  grade?: string;

  @Column({ type: 'float', nullable: true })
  credit?: number;

  @Column({ type: 'varchar', nullable: true })
  time?: string;

  @Column({ type: 'varchar', nullable: true })
  instructor?: string;

  @Column({ type: 'varchar', nullable: true })
  classroom?: string;

  @Column({ name: 'course_type', type: 'varchar', nullable: true })
  courseType?: string;

  @Column({ name: 'syllabus_url', type: 'varchar', nullable: true })
  syllabusUrl?: string;
}
