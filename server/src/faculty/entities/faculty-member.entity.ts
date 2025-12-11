import { Entity, Column } from 'typeorm';
import { SoftDeleteEntity } from '@/common/entities';

@Entity('faculty_members')
export class FacultyMember extends SoftDeleteEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'job_title', type: 'varchar', nullable: true })
  jobTitle?: string;

  @Column({ name: 'appointment_type', type: 'varchar', nullable: true })
  appointmentType?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ name: 'phone_number', type: 'varchar', nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  office?: string;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  department?: string;

  @Column({ type: 'varchar', nullable: true })
  college?: string;

  @Column({ name: 'research_areas', type: 'json', nullable: true })
  researchAreas?: string[];

  @Column({ type: 'text', nullable: true })
  biography?: string;
}
