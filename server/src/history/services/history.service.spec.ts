import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { HistoryService } from '@/history/services/history.service';
import { History } from '@/history/entities';
import { CommonException } from '@/common/exceptions';
import { PagedResponse } from '@/common/dto/response.dto';

describe('HistoryService', () => {
  let service: HistoryService;
  let historyRepository: jest.Mocked<Repository<History>>;

  const mockHistory = {
    id: 'history-1',
    year: 2024,
    month: 3,
    title: '지능IoT학과 설립',
    description: '지능IoT학과가 새롭게 설립되었습니다.',
  } as any;

  const mockHistory2 = {
    id: 'history-2',
    year: 2023,
    month: 9,
    title: '첫 번째 졸업생 배출',
    description: '첫 번째 졸업생들이 배출되었습니다.',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: getRepositoryToken(History),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    historyRepository = module.get(getRepositoryToken(History));

    jest.clearAllMocks();
    
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('findAll', () => {
    it('should return paginated histories successfully', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockHistory, mockHistory2], 2]),
      };

      historyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 1, size: 10 });

      expect(result).toBeInstanceOf(PagedResponse);
      expect(result.items).toHaveLength(2);
      expect(result.meta.totalElements).toBe(2);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('history.year', 'DESC');
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('history.month', 'ASC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should filter by year when provided', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockHistory], 1]),
      };

      historyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ year: 2024 });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('history.year = :year', { year: 2024 });
    });

    it('should sort by year ascending when specified', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      historyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ sort: 'asc' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('history.year', 'ASC');
    });

    it('should use default sorting (desc) when not specified', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      historyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({});

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('history.year', 'DESC');
    });

    it('should return empty results when no histories found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      historyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({});

      expect(result.items).toHaveLength(0);
      expect(result.meta.totalElements).toBe(0);
    });

    it('should throw CommonException when database error occurs', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      historyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(service.findAll({})).rejects.toThrow(CommonException);
    });
  });

  describe('findOne', () => {
    it('should return history by id successfully', async () => {
      historyRepository.findOne.mockResolvedValue(mockHistory);

      const result = await service.findOne('history-1');

      expect(result.id).toBe('history-1');
      expect(result.title).toBe('지능IoT학과 설립');
      expect(historyRepository.findOne).toHaveBeenCalledWith({ where: { id: 'history-1' } });
    });

    it('should throw HistoryException when history not found', async () => {
      historyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow('연혁을 찾을 수 없습니다');
    });

    it('should throw CommonException when database error occurs', async () => {
      historyRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('history-1')).rejects.toThrow(CommonException);
    });
  });

  describe('create', () => {
    it('should create history successfully', async () => {
      const createDto = {
        year: 2024,
        month: 3,
        title: '새로운 연혁',
        description: '새로운 연혁이 추가되었습니다.',
      };

      historyRepository.create.mockReturnValue(mockHistory);
      historyRepository.save.mockResolvedValue(mockHistory);

      const result = await service.create(createDto);

      expect(result.id).toBe('history-1');
      expect(historyRepository.create).toHaveBeenCalledWith({
        year: 2024,
        month: 3,
        title: '새로운 연혁',
        description: '새로운 연혁이 추가되었습니다.',
      });
      expect(historyRepository.save).toHaveBeenCalled();
    });

    it('should throw CommonException when database error occurs', async () => {
      const createDto = {
        year: 2024,
        month: 3,
        title: '새로운 연혁',
        description: '새로운 연혁이 추가되었습니다.',
      };

      historyRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createDto)).rejects.toThrow(CommonException);
    });
  });

  describe('update', () => {
    it('should update history successfully', async () => {
      const updateDto = {
        title: '수정된 제목',
        description: '수정된 설명',
      };

      historyRepository.findOne.mockResolvedValue(mockHistory);
      historyRepository.save.mockResolvedValue({ ...mockHistory, ...updateDto } as any);

      const result = await service.update('history-1', updateDto);

      expect(result.title).toBe('수정된 제목');
      expect(historyRepository.findOne).toHaveBeenCalledWith({ where: { id: 'history-1' } });
      expect(historyRepository.save).toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const updateDto = {
        title: '새 제목',
      };

      historyRepository.findOne.mockResolvedValue(mockHistory);
      historyRepository.save.mockResolvedValue(mockHistory);

      await service.update('history-1', updateDto);

      const savedHistory = historyRepository.save.mock.calls[0][0];
      expect(savedHistory.title).toBe('새 제목');
      expect(savedHistory.year).toBe(mockHistory.year); // unchanged
      expect(savedHistory.month).toBe(mockHistory.month); // unchanged
    });

    it('should throw HistoryException when history not found', async () => {
      historyRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow('연혁을 찾을 수 없습니다');
    });

    it('should throw CommonException when database error occurs', async () => {
      historyRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.update('history-1', {})).rejects.toThrow(CommonException);
    });
  });

  describe('delete', () => {
    it('should delete history successfully', async () => {
      historyRepository.findOne.mockResolvedValue(mockHistory);
      historyRepository.remove.mockResolvedValue(mockHistory);

      await service.delete('history-1');

      expect(historyRepository.findOne).toHaveBeenCalledWith({ where: { id: 'history-1' } });
      expect(historyRepository.remove).toHaveBeenCalledWith(mockHistory);
    });

    it('should throw HistoryException when history not found', async () => {
      historyRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow('연혁을 찾을 수 없습니다');
    });

    it('should throw CommonException when database error occurs', async () => {
      historyRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('history-1')).rejects.toThrow(CommonException);
    });
  });

  describe('toResponse (private method testing through public methods)', () => {
    it('should convert history entity to response DTO correctly', async () => {
      const freshMockHistory = {
        id: 'history-1',
        year: 2024,
        month: 3,
        title: '지능IoT학과 설립',
        description: '지능IoT학과가 새롭게 설립되었습니다.',
      } as any;
      
      historyRepository.findOne.mockResolvedValue(freshMockHistory);

      const result = await service.findOne('history-1');

      expect(result).toEqual({
        id: 'history-1',
        year: 2024,
        month: 3,
        title: '지능IoT학과 설립',
        description: '지능IoT학과가 새롭게 설립되었습니다.',
      });
    });
  });
});
