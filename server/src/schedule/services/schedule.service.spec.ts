import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ScheduleService } from '@/schedule/services/schedule.service';
import { AcademicSchedule, ScheduleCategory } from '@/schedule/entities';
import { CommonException } from '@/common/exceptions';
import { PagedResponse } from '@/common/dto/response.dto';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let scheduleRepository: jest.Mocked<Repository<AcademicSchedule>>;

  const mockSchedule = {
    id: 'schedule-1',
    title: '중간고사',
    description: '2024년 1학기 중간고사',
    startDate: new Date('2024-04-15'),
    endDate: new Date('2024-04-19'),
    location: '각 강의실',
    category: ScheduleCategory.ACADEMIC,
    createdById: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: getRepositoryToken(AcademicSchedule),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softRemove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    scheduleRepository = module.get(getRepositoryToken(AcademicSchedule));

    jest.clearAllMocks();
    
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('findAll', () => {
    it('should return empty paginated schedules successfully', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      scheduleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 1, size: 10 });

      expect(result).toBeInstanceOf(PagedResponse);
      expect(result.items).toHaveLength(0);
      expect(result.meta.totalElements).toBe(0);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('schedule.deletedAt IS NULL');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('schedule.startDate', 'ASC');
    });

    it('should filter by specific date when provided', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      scheduleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ date: '2024-04-15' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'DATE(schedule.startDate) <= :date AND (schedule.endDate IS NULL OR DATE(schedule.endDate) >= :date)',
        { date: '2024-04-15' }
      );
    });

    it('should filter by month when provided', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      scheduleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ month: '2024-04' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'YEAR(schedule.startDate) = :year AND MONTH(schedule.startDate) = :month',
        { year: 2024, month: 4 }
      );
    });

    it('should filter by category when provided', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      scheduleRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ category: ScheduleCategory.EVENT });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'schedule.category = :category',
        { category: ScheduleCategory.EVENT }
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      scheduleRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findAll({})).rejects.toThrow(CommonException);
    });
  });

  describe('findOne', () => {
    it('should return schedule by id successfully', async () => {
      scheduleRepository.findOne.mockResolvedValue(mockSchedule);

      const result = await service.findOne('schedule-1');

      expect(result.id).toBe('schedule-1');
      expect(result.title).toBe('중간고사');
      expect(scheduleRepository.findOne).toHaveBeenCalledWith({ where: { id: 'schedule-1' } });
    });

    it('should throw ScheduleException when schedule not found', async () => {
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow('해당하는 일정을 찾을 수 없습니다');
    });

    it('should throw CommonException when database error occurs', async () => {
      scheduleRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('schedule-1')).rejects.toThrow(CommonException);
    });
  });

  describe('create', () => {
    it('should create schedule successfully with all fields', async () => {
      const createDto = {
        title: '새로운 일정',
        description: '새로운 학사일정입니다',
        startDate: '2024-05-01',
        endDate: '2024-05-03',
        location: '강의실 101',
        category: ScheduleCategory.EVENT,
      };

      scheduleRepository.create.mockReturnValue(mockSchedule);
      scheduleRepository.save.mockResolvedValue(mockSchedule);

      const result = await service.create(createDto, 'user-1');

      expect(result.id).toBe('schedule-1');
      expect(scheduleRepository.create).toHaveBeenCalledWith({
        title: '새로운 일정',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-05-03'),
        description: '새로운 학사일정입니다',
        location: '강의실 101',
        category: ScheduleCategory.EVENT,
        createdById: 'user-1',
      });
    });

    it('should throw CommonException when database error occurs', async () => {
      const createDto = {
        title: '새로운 일정',
        description: '새로운 학사일정입니다',
        startDate: '2024-05-01',
        category: ScheduleCategory.ACADEMIC,
      };

      scheduleRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(CommonException);
    });
  });

  describe('update', () => {
    it('should update schedule successfully', async () => {
      const updateDto = {
        title: '수정된 제목',
        description: '수정된 설명',
      };

      scheduleRepository.findOne.mockResolvedValue(mockSchedule);
      scheduleRepository.save.mockResolvedValue({ ...mockSchedule, ...updateDto } as any);

      const result = await service.update('schedule-1', updateDto);

      expect(result.title).toBe('수정된 제목');
      expect(scheduleRepository.findOne).toHaveBeenCalledWith({ where: { id: 'schedule-1' } });
    });

    it('should throw ScheduleException when schedule not found', async () => {
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow('해당하는 일정을 찾을 수 없습니다');
    });

    it('should throw CommonException when database error occurs', async () => {
      scheduleRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.update('schedule-1', {})).rejects.toThrow(CommonException);
    });
  });

  describe('delete', () => {
    it('should delete schedule successfully (soft delete)', async () => {
      scheduleRepository.findOne.mockResolvedValue(mockSchedule);
      scheduleRepository.softRemove.mockResolvedValue(mockSchedule);

      await service.delete('schedule-1');

      expect(scheduleRepository.findOne).toHaveBeenCalledWith({ where: { id: 'schedule-1' } });
      expect(scheduleRepository.softRemove).toHaveBeenCalledWith(mockSchedule);
    });

    it('should throw ScheduleException when schedule not found', async () => {
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow('해당하는 일정을 찾을 수 없습니다');
    });

    it('should throw CommonException when database error occurs', async () => {
      scheduleRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('schedule-1')).rejects.toThrow(CommonException);
    });
  });

  describe('toResponse (private method testing through public methods)', () => {
    it('should convert schedule entity to response DTO correctly', async () => {
      const freshMockSchedule = {
        id: 'schedule-1',
        title: '중간고사',
        description: '2024년 1학기 중간고사',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-19'),
        location: '각 강의실',
        category: ScheduleCategory.ACADEMIC,
        createdById: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
      } as any;
      
      scheduleRepository.findOne.mockResolvedValue(freshMockSchedule);

      const result = await service.findOne('schedule-1');

      expect(result).toEqual({
        id: 'schedule-1',
        title: '중간고사',
        description: '2024년 1학기 중간고사',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-19'),
        location: '각 강의실',
        category: ScheduleCategory.ACADEMIC,
      });
    });
  });
});
