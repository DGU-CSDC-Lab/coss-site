import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacultyMember } from '../entities';
import {
  FacultyCreate,
  FacultyUpdate,
  FacultyResponse,
  FacultyQuery,
} from '../dto/faculty.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(FacultyMember)
    private facultyRepository: Repository<FacultyMember>,
  ) {}

  async findAll(query: FacultyQuery): Promise<PagedResponse<FacultyResponse>> {
    const { name, department, page = 1, size = 20 } = query;

    const queryBuilder = this.facultyRepository.createQueryBuilder('faculty');

    if (name)
      queryBuilder.andWhere('faculty.name LIKE :name', { name: `%${name}%` });
    if (department)
      queryBuilder.andWhere('faculty.department LIKE :department', {
        department: `%${department}%`,
      });

    const [faculty, totalElements] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .orderBy('faculty.name', 'ASC')
      .getManyAndCount();

    const items = faculty.map(this.toResponse);
    return new PagedResponse(items, page, size, totalElements);
  }

  async findOne(id: string): Promise<FacultyResponse> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });
    if (!faculty) {
      throw new NotFoundException('Faculty member not found');
    }
    return this.toResponse(faculty);
  }

  async create(createDto: FacultyCreate): Promise<FacultyResponse> {
    if (createDto.email) {
      const existingFaculty = await this.facultyRepository.findOne({
        where: { email: createDto.email },
      });
      if (existingFaculty) {
        throw new ConflictException('Email already exists');
      }
    }

    const faculty = this.facultyRepository.create(createDto);
    const saved = await this.facultyRepository.save(faculty);
    return this.toResponse(saved);
  }

  async update(id: string, updateDto: FacultyUpdate): Promise<FacultyResponse> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });
    if (!faculty) {
      throw new NotFoundException('Faculty member not found');
    }

    if (updateDto.email && updateDto.email !== faculty.email) {
      const existingFaculty = await this.facultyRepository.findOne({
        where: { email: updateDto.email },
      });
      if (existingFaculty) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(faculty, updateDto);
    const saved = await this.facultyRepository.save(faculty);
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const faculty = await this.facultyRepository.findOne({ where: { id } });
    if (!faculty) {
      throw new NotFoundException('Faculty member not found');
    }
    await this.facultyRepository.remove(faculty);
  }

  private toResponse(faculty: FacultyMember): FacultyResponse {
    return {
      id: faculty.id,
      name: faculty.name,
      jobTitle: faculty.jobTitle,
      email: faculty.email,
      phoneNumber: faculty.phoneNumber,
      office: faculty.office,
      profileImageUrl: faculty.profileImageUrl,
      department: faculty.department,
      researchAreas: faculty.researchAreas,
      biography: faculty.biography,
      createdAt: faculty.createdAt,
      updatedAt: faculty.updatedAt,
    };
  }
}
