import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { HistoryService } from './history.service';
import { History } from '../entities';

describe('HistoryService', () => {
  let service: HistoryService;
  let repository: Repository<History>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
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
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: getRepositoryToken(History),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    repository = module.get<Repository<History>>(getRepositoryToken(History));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all histories', async () => {
      const mockHistories = [
        {
          id: '1',
          year: 2024,
          month: 3,
          title: 'Department Founded',
          description: 'IoT Department was established',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockHistories, 1]);

      const result = await service.findAll({});

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Department Founded');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'history.year',
        'DESC',
      );
    });

    it('should filter by year', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ year: 2024 });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'history.year = :year',
        { year: 2024 },
      );
    });

    it('should sort in ascending order', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ sort: 'asc' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'history.year',
        'ASC',
      );
    });
  });

  describe('findOne', () => {
    it('should return history by id', async () => {
      const mockHistory = {
        id: '1',
        year: 2024,
        month: 3,
        title: 'Department Founded',
        description: 'IoT Department was established',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockHistory);

      const result = await service.findOne('1');

      expect(result.title).toBe('Department Founded');
    });

    it('should throw NotFoundException when history not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create new history', async () => {
      const createDto = {
        year: 2024,
        month: 3,
        title: 'New Event',
        description: 'A new milestone was achieved',
      };

      const mockHistory = {
        id: '1',
        ...createDto,
        event: createDto.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockHistory);
      mockRepository.save.mockResolvedValue(mockHistory);

      const result = await service.create(createDto);

      expect(result.title).toBe('New Event');
    });
  });

  describe('update', () => {
    it('should update existing history', async () => {
      const updateDto = {
        title: 'Updated Event',
        description: 'Updated description',
      };

      const mockHistory = {
        id: '1',
        year: 2024,
        month: 3,
        title: 'Old Event',
        description: 'Old description',
        event: 'Old description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockHistory);
      mockRepository.save.mockResolvedValue({
        ...mockHistory,
        ...updateDto,
        event: updateDto.description,
      });

      const result = await service.update('1', updateDto);

      expect(result.title).toBe('Updated Event');
    });

    it('should throw NotFoundException when updating non-existent history', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete history', async () => {
      const mockHistory = { id: '1', title: 'Test History' };
      mockRepository.findOne.mockResolvedValue(mockHistory);

      await service.delete('1');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockHistory);
    });

    it('should throw NotFoundException when deleting non-existent history', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
