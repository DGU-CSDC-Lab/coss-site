import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities';

@Entity('faculty_members')
export class FacultyMember extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'job_title', type: 'varchar', nullable: true })
  jobTitle?: string;

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

  @Column({ name: 'research_area', type: 'text', nullable: true })
  researchArea?: string;

  @Column({ type: 'text', nullable: true })
  biography?: string;
}
