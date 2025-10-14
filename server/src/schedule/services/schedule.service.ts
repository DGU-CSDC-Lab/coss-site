import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicSchedule, ScheduleCategory } from '@/schedule/entities';
import {
  ScheduleCreate,
  ScheduleUpdate,
  ScheduleResponse,
  ScheduleQuery,
} from '@/schedule/dto/schedule.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { CommonException, ScheduleException } from '@/common/exceptions';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectRepository(AcademicSchedule)
    private scheduleRepository: Repository<AcademicSchedule>,
  ) {}

  /**
   * 학사일정 목록 조회
   * - 다양한 필터링 옵션 제공 (날짜, 월, 연도, 카테고리, 검색어)
   * - 시작일 기준 오름차순 정렬
   * - 페이지네이션 적용
   * - 소프트 삭제된 일정은 제외
   * @param query 검색 조건 및 페이지 정보
   * @returns 페이지네이션된 학사일정 목록
   */
  async findAll(
    query: ScheduleQuery,
  ): Promise<PagedResponse<ScheduleResponse>> {
    this.logger.log(`Finding schedules with query: ${JSON.stringify(query)}`);

    const { month, category, year, date, search, page = 1, size = 10 } = query;

    try {
      // 학사일정 조회를 위한 쿼리 빌더 생성 (소프트 삭제 제외)
      const queryBuilder = this.scheduleRepository
        .createQueryBuilder('schedule')
        .where('schedule.deletedAt IS NULL');

      this.logger.debug('Base query created with soft delete filter');

      // 특정 날짜 필터링 - 해당 날짜가 일정 기간에 포함되는지 확인
      if (date) {
        queryBuilder.andWhere(
          'DATE(schedule.startDate) <= :date AND (schedule.endDate IS NULL OR DATE(schedule.endDate) >= :date)',
          { date },
        );
        this.logger.debug(`Filtering by specific date: ${date}`);
      }
      // 특정 월 필터링 - YYYY-MM 형식으로 받아서 연도와 월로 분리
      else if (month) {
        const [yearNum, monthNum] = month.split('-');
        const parsedYear = parseInt(yearNum);
        const parsedMonth = parseInt(monthNum);

        queryBuilder.andWhere(
          'YEAR(schedule.startDate) = :year AND MONTH(schedule.startDate) = :month',
          {
            year: parsedYear,
            month: parsedMonth,
          },
        );
        this.logger.debug(
          `Filtering by month: ${month} (year: ${parsedYear}, month: ${parsedMonth})`,
        );
      }
      // 특정 연도 필터링
      else if (year) {
        const parsedYear = parseInt(year);
        queryBuilder.andWhere('YEAR(schedule.startDate) = :year', {
          year: parsedYear,
        });
        this.logger.debug(`Filtering by year: ${parsedYear}`);
      }

      // 카테고리별 필터링
      if (category) {
        queryBuilder.andWhere('schedule.category = :category', { category });
        this.logger.debug(`Filtering by category: ${category}`);
      }

      // 제목 검색 (부분 일치)
      if (search) {
        queryBuilder.andWhere('schedule.title LIKE :search', {
          search: `%${search}%`,
        });
        this.logger.debug(`Searching with keyword: ${search}`);
      }

      // 데이터 조회 및 총 개수 계산
      const [schedules, totalElements] = await queryBuilder
        .orderBy('schedule.startDate', 'ASC') // 시작일 기준 오름차순 정렬
        .skip((page - 1) * size) // 페이지네이션 오프셋
        .take(size) // 페이지 크기
        .getManyAndCount();

      this.logger.log(
        `Found ${schedules.length} schedules out of ${totalElements} total`,
      );
      this.logger.debug(
        `Query executed successfully with pagination: page ${page}, size ${size}`,
      );

      // 엔티티를 응답 DTO로 변환
      const items = schedules.map(schedule => this.toResponse(schedule));
      this.logger.log(
        `Successfully returned ${items.length} schedules for page ${page}`,
      );

      return new PagedResponse(items, page, size, totalElements);
    } catch (error) {
      this.logger.error(
        `Failed to find schedules: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 학사일정 상세 조회
   * - ID로 특정 학사일정 정보 조회
   * @param id 학사일정 ID
   * @returns 학사일정 상세 정보
   * @throws NotFoundException 학사일정을 찾을 수 없는 경우
   */
  async findOne(id: string): Promise<ScheduleResponse> {
    this.logger.log(`Finding schedule by id: ${id}`);

    try {
      const schedule = await this.scheduleRepository.findOne({ where: { id } });

      if (!schedule) {
        this.logger.warn(`Schedule not found: ${id}`);
        throw ScheduleException.scheduleNotFound(id);
      }

      this.logger.log(
        `Found schedule: ${schedule.title} (${schedule.startDate.toISOString().split('T')[0]})`,
      );
      this.logger.debug(
        `Schedule details - Category: ${schedule.category}, Location: ${schedule.location || 'N/A'}`,
      );

      return this.toResponse(schedule);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find schedule ${id}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 새 학사일정 생성
   * - 제목, 시작일, 종료일, 설명, 장소, 카테고리 정보로 새로운 학사일정 생성
   * - 종료일은 선택사항 (단일 날짜 일정의 경우 null)
   * - 카테고리 미지정 시 기본값은 ACADEMIC
   * @param createDto 학사일정 생성 데이터
   * @param createdById 생성자 ID
   * @returns 생성된 학사일정 정보
   */
  async create(
    createDto: ScheduleCreate,
    createdById: string,
  ): Promise<ScheduleResponse> {
    this.logger.log(
      `Creating new schedule: ${createDto.title} by user: ${createdById}`,
    );
    this.logger.debug(
      `Schedule details - Start: ${createDto.startDate}, End: ${createDto.endDate || 'N/A'}, Category: ${createDto.category || 'ACADEMIC'}`,
    );

    try {
      // 날짜 변환 로깅
      const startDate = new Date(createDto.startDate);
      const endDate = createDto.endDate
        ? new Date(createDto.endDate)
        : undefined;

      this.logger.debug(
        `Date conversion - Start: ${startDate.toISOString()}, End: ${endDate?.toISOString() || 'N/A'}`,
      );

      // 새 학사일정 엔티티 생성
      const schedule = this.scheduleRepository.create({
        title: createDto.title,
        startDate: startDate, // 문자열을 Date 객체로 변환
        endDate: endDate, // 종료일이 있는 경우만 변환
        description: createDto.description,
        location: createDto.location,
        category: createDto.category || ScheduleCategory.ACADEMIC, // 기본값 설정
        createdById,
      });

      this.logger.debug(
        `Schedule entity created with category: ${schedule.category}`,
      );

      // 데이터베이스에 저장
      const saved = await this.scheduleRepository.save(schedule);
      this.logger.log(
        `Schedule created successfully: ${saved.id} - ${saved.title}`,
      );
      this.logger.debug(
        `Saved schedule ID: ${saved.id}, Created at: ${saved.createdAt}`,
      );

      return this.toResponse(saved);
    } catch (error) {
      this.logger.error(
        `Failed to create schedule: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 학사일정 정보 수정
   * - 기존 학사일정 존재 여부 확인 후 수정
   * - 제공된 필드만 업데이트 (부분 업데이트)
   * - 날짜 필드는 문자열을 Date 객체로 변환
   * @param id 수정할 학사일정 ID
   * @param updateDto 수정할 데이터
   * @returns 수정된 학사일정 정보
   * @throws NotFoundException 학사일정을 찾을 수 없는 경우
   */
  async update(
    id: string,
    updateDto: ScheduleUpdate,
  ): Promise<ScheduleResponse> {
    this.logger.log(`Updating schedule: ${id}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateDto)}`);

    try {
      // 기존 학사일정 조회
      const schedule = await this.scheduleRepository.findOne({ where: { id } });

      if (!schedule) {
        this.logger.warn(`Schedule not found for update: ${id}`);
        throw ScheduleException.scheduleNotFound(id);
      }

      this.logger.debug(`Found schedule to update: ${schedule.title}`);

      // 날짜 변환 로깅
      const newStartDate = updateDto.startDate
        ? new Date(updateDto.startDate)
        : schedule.startDate;
      const newEndDate = updateDto.endDate
        ? new Date(updateDto.endDate)
        : schedule.endDate;

      if (updateDto.startDate) {
        this.logger.debug(
          `Start date will be updated: ${schedule.startDate.toISOString()} -> ${newStartDate.toISOString()}`,
        );
      }
      if (updateDto.endDate) {
        this.logger.debug(
          `End date will be updated: ${schedule.endDate?.toISOString() || 'N/A'} -> ${newEndDate?.toISOString() || 'N/A'}`,
        );
      }

      // 제공된 필드만 업데이트 (null 병합 연산자 사용)
      Object.assign(schedule, {
        title: updateDto.title ?? schedule.title,
        startDate: newStartDate,
        endDate: newEndDate,
        description: updateDto.description ?? schedule.description,
        location: updateDto.location ?? schedule.location,
        category: updateDto.category ?? schedule.category,
      });

      this.logger.debug(
        `Schedule fields updated - Title: ${schedule.title}, Category: ${schedule.category}`,
      );

      // 변경사항 저장
      const saved = await this.scheduleRepository.save(schedule);
      this.logger.log(
        `Schedule updated successfully: ${saved.id} - ${saved.title}`,
      );
      this.logger.debug(`Updated at: ${saved.updatedAt}`);

      return this.toResponse(saved);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update schedule ${id}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 학사일정 삭제 (소프트 삭제)
   * - 학사일정 존재 여부 확인 후 소프트 삭제
   * - 실제 데이터는 삭제하지 않고 deletedAt 필드만 설정
   * @param id 삭제할 학사일정 ID
   * @throws NotFoundException 학사일정을 찾을 수 없는 경우
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting schedule: ${id}`);

    try {
      // 삭제할 학사일정 조회
      const schedule = await this.scheduleRepository.findOne({ where: { id } });

      if (!schedule) {
        this.logger.warn(`Schedule not found for deletion: ${id}`);
        throw ScheduleException.scheduleNotFound(id);
      }

      this.logger.debug(
        `Found schedule to delete: ${schedule.title} (${schedule.startDate.toISOString().split('T')[0]})`,
      );

      // 소프트 삭제 실행 (deletedAt 필드 설정)
      await this.scheduleRepository.softRemove(schedule);
      this.logger.log(
        `Schedule soft deleted successfully: ${id} - ${schedule.title}`,
      );
      this.logger.debug(`Soft delete completed - deletedAt field will be set`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete schedule ${id}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 학사일정 엔티티를 응답 DTO로 변환
   * - 클라이언트에게 반환할 형태로 데이터 변환
   * - 필요한 필드만 선별하여 응답 구성
   * @param schedule 학사일정 엔티티
   * @returns 학사일정 응답 DTO
   */
  private toResponse(schedule: AcademicSchedule): ScheduleResponse {
    this.logger.debug(
      `Converting schedule entity to response DTO: ${schedule.id}`,
    );

    return {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      location: schedule.location,
      category: schedule.category,
    };
  }
}
