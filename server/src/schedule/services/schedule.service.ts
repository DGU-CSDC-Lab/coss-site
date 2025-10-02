import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicSchedule, ScheduleCategory } from '../entities';
import { ScheduleCreate, ScheduleUpdate, ScheduleResponse, ScheduleQuery } from '../dto/schedule.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(AcademicSchedule)
    private scheduleRepository: Repository<AcademicSchedule>,
  ) {}

  async findAll(query: ScheduleQuery): Promise<PagedResponse<ScheduleResponse>> {
    const { month, category, year, page = 1, size = 10 } = query;
    
    const queryBuilder = this.scheduleRepository.createQueryBuilder('schedule')
      .where('schedule.deletedAt IS NULL');

    if (month) {
      const [yearNum, monthNum] = month.split('-');
      queryBuilder.andWhere('YEAR(schedule.startDate) = :year AND MONTH(schedule.startDate) = :month', {
        year: parseInt(yearNum),
        month: parseInt(monthNum),
      });
    } else if (year) {
      queryBuilder.andWhere('YEAR(schedule.startDate) = :year', {
        year: parseInt(year),
      });
    }

    if (category) {
      queryBuilder.andWhere('schedule.category = :category', { category });
    }

    const [schedules, totalElements] = await queryBuilder
      .orderBy('schedule.startDate', 'ASC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const items = schedules.map(this.toResponse);
    return new PagedResponse(items, page, size, totalElements);
  }

  async findOne(id: string): Promise<ScheduleResponse> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return this.toResponse(schedule);
  }

  async create(createDto: ScheduleCreate, createdById: string): Promise<ScheduleResponse> {
    const schedule = this.scheduleRepository.create({
      title: createDto.title,
      startDate: new Date(createDto.startDate),
      endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
      description: createDto.description,
      category: createDto.category || ScheduleCategory.ACADEMIC,
      createdById,
    });

    const saved = await this.scheduleRepository.save(schedule);
    return this.toResponse(saved);
  }

  async update(id: string, updateDto: ScheduleUpdate): Promise<ScheduleResponse> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    Object.assign(schedule, {
      title: updateDto.title ?? schedule.title,
      startDate: updateDto.startDate ? new Date(updateDto.startDate) : schedule.startDate,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : schedule.endDate,
      description: updateDto.description ?? schedule.description,
      category: updateDto.category ?? schedule.category,
    });

    const saved = await this.scheduleRepository.save(schedule);
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    await this.scheduleRepository.softRemove(schedule);
  }

  private toResponse(schedule: AcademicSchedule): ScheduleResponse {
    return {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      category: schedule.category,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }
}
