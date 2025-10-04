import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AcademicSchedule, ScheduleCategory } from '../entities';

describe('ScheduleService', () => {
  let service: ScheduleService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: getRepositoryToken(AcademicSchedule),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    repository = module.get<Repository<AcademicSchedule>>(
      getRepositoryToken(AcademicSchedule),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all schedules', async () => {
      const mockSchedules = [
        {
          id: '1',
          title: 'Test Schedule',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-02'),
          category: ScheduleCategory.ACADEMIC,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockSchedules, 1]);

      const result = await service.findAll({});

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Test Schedule');
    });

    it('should filter by month', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ month: '2024-01' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'YEAR(schedule.startDate) = :year AND MONTH(schedule.startDate) = :month',
        { year: 2024, month: 1 },
      );
    });

    it('should filter by category', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ category: ScheduleCategory.ADMISSION });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'schedule.category = :category',
        { category: ScheduleCategory.ADMISSION },
      );
    });
  });

  describe('findOne', () => {
    it('should return schedule by id', async () => {
      const mockSchedule = {
        id: '1',
        title: 'Test Schedule',
        startDate: new Date('2024-01-01'),
        category: ScheduleCategory.ACADEMIC,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockSchedule);

      const result = await service.findOne('1');

      expect(result.title).toBe('Test Schedule');
    });

    it('should throw NotFoundException when schedule not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create new schedule', async () => {
      const createDto = {
        title: 'New Schedule',
        startDate: '2024-01-01',
        endDate: '2024-01-02',
        description: 'Test description',
        category: ScheduleCategory.ACADEMIC,
      };

      const mockSchedule = {
        id: '1',
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockSchedule);
      mockRepository.save.mockResolvedValue(mockSchedule);

      const result = await service.create(createDto, 'user1');

      expect(result.title).toBe('New Schedule');
    });
  });

  describe('update', () => {
    it('should update existing schedule', async () => {
      const updateDto = {
        title: 'Updated Schedule',
        description: 'Updated description',
      };

      const mockSchedule = {
        id: '1',
        title: 'Old Schedule',
        startDate: new Date('2024-01-01'),
        category: ScheduleCategory.ACADEMIC,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockSchedule);
      mockRepository.save.mockResolvedValue({ ...mockSchedule, ...updateDto });

      const result = await service.update('1', updateDto);

      expect(result.title).toBe('Updated Schedule');
    });

    it('should throw NotFoundException when updating non-existent schedule', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete schedule', async () => {
      const mockSchedule = { id: '1', title: 'Test Schedule' };
      mockRepository.findOne.mockResolvedValue(mockSchedule);

      await service.delete('1');

      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockSchedule);
    });

    it('should throw NotFoundException when deleting non-existent schedule', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
