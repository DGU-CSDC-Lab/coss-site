import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { PopupService } from '@/popup/services/popup.service';
import { Popup } from '@/popup/entities';
import { CommonException } from '@/common/exceptions';
import { PagedResponse } from '@/common/dto/response.dto';
import { FileService } from '@/file/services/file.service';

describe('PopupService', () => {
  let service: PopupService;
  let popupRepository: jest.Mocked<Repository<Popup>>;

  const mockPopup = {
    id: 'popup-1',
    title: '중요 공지사항',
    content: '중요한 공지사항입니다.',
    imageUrl: 'https://example.com/popup.jpg',
    linkUrl: 'https://example.com/notice',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01T10:00:00.000Z'),
    isActive: true,
    priority: 1,
    createdById: 'user-1',
  } as any;

  const mockPopup2 = {
    id: 'popup-2',
    title: '이벤트 안내',
    content: '새로운 이벤트가 시작되었습니다.',
    imageUrl: 'https://example.com/event.jpg',
    linkUrl: 'https://example.com/event',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-28'),
    createdAt: new Date('2024-02-01T10:00:00.000Z'),
    isActive: false,
    priority: 2,
    createdById: 'user-2',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PopupService,
        {
          provide: getRepositoryToken(Popup),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softRemove: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            updateOwner: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PopupService>(PopupService);
    popupRepository = module.get(getRepositoryToken(Popup));

    jest.clearAllMocks();
    
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('findAll', () => {
    it('should return paginated popups successfully', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPopup, mockPopup2], 2]),
      };

      popupRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 1, size: 10 });

      expect(result).toBeInstanceOf(PagedResponse);
      expect(result.items).toHaveLength(2);
      expect(result.meta.totalElements).toBe(2);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('popup.deletedAt IS NULL');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('popup.priority', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should filter by isActive when provided', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPopup], 1]),
      };

      popupRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ isActive: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('popup.isActive = :isActive', { isActive: true });
    });

    it('should return empty results when no popups found', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      popupRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({});

      expect(result.items).toHaveLength(0);
      expect(result.meta.totalElements).toBe(0);
    });

    it('should throw CommonException when database error occurs', async () => {
      popupRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findAll({})).rejects.toThrow(CommonException);
    });
  });

  describe('findActive', () => {
    it('should return active popups successfully', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPopup]),
      };

      popupRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findActive();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('popup-1');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('popup.deletedAt IS NULL');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('popup.isActive = :active', { active: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('popup.startDate <= :now', { now: expect.any(Date) });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('popup.endDate >= :now', { now: expect.any(Date) });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('popup.priority', 'DESC');
    });

    it('should return empty array when no active popups found', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      popupRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findActive();

      expect(result).toHaveLength(0);
    });

    it('should throw CommonException when database error occurs', async () => {
      popupRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findActive()).rejects.toThrow(CommonException);
    });
  });

  describe('findOne', () => {
    it('should return popup by id successfully', async () => {
      popupRepository.findOne.mockResolvedValue(mockPopup);

      const result = await service.findOne('popup-1');

      expect(result.id).toBe('popup-1');
      expect(result.title).toBe('중요 공지사항');
      expect(popupRepository.findOne).toHaveBeenCalledWith({ where: { id: 'popup-1' } });
    });

    it('should throw PopupException when popup not found', async () => {
      popupRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow('팝업을 찾을 수 없습니다.');
    });

    it('should throw CommonException when database error occurs', async () => {
      popupRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('popup-1')).rejects.toThrow(CommonException);
    });
  });

  describe('create', () => {
    it('should create popup successfully', async () => {
      const createDto = {
        title: '새로운 팝업',
        content: '새로운 팝업 내용',
        imageUrl: 'https://example.com/new.jpg',
        linkUrl: 'https://example.com/new',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        priority: 1,
      };

      popupRepository.create.mockReturnValue(mockPopup);
      popupRepository.save.mockResolvedValue(mockPopup);

      const result = await service.create(createDto, 'user-1');

      expect(result.id).toBe('popup-1');
      expect(popupRepository.create).toHaveBeenCalledWith({
        ...createDto,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdById: 'user-1',
      });
      expect(popupRepository.save).toHaveBeenCalled();
    });

    it('should throw CommonException when database error occurs', async () => {
      const createDto = {
        title: '새로운 팝업',
        content: '새로운 팝업 내용',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        priority: 1,
      };

      popupRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(CommonException);
    });
  });

  describe('update', () => {
    it('should update popup successfully', async () => {
      const updateDto = {
        title: '수정된 제목',
        content: '수정된 내용',
      };

      popupRepository.findOne.mockResolvedValue(mockPopup);
      popupRepository.save.mockResolvedValue({ ...mockPopup, ...updateDto } as any);

      const result = await service.update('popup-1', updateDto);

      expect(result.title).toBe('수정된 제목');
      expect(popupRepository.findOne).toHaveBeenCalledWith({ where: { id: 'popup-1' } });
      expect(popupRepository.save).toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const updateDto = {
        title: '새 제목',
      };

      popupRepository.findOne.mockResolvedValue(mockPopup);
      popupRepository.save.mockResolvedValue(mockPopup);

      await service.update('popup-1', updateDto);

      const savedPopup = popupRepository.save.mock.calls[0][0];
      expect(savedPopup.title).toBe('새 제목');
      expect(savedPopup.content).toBe(mockPopup.content); // unchanged
    });

    it('should update dates when provided', async () => {
      const updateDto = {
        startDate: '2024-06-01',
        endDate: '2024-06-30',
      };

      popupRepository.findOne.mockResolvedValue(mockPopup);
      popupRepository.save.mockResolvedValue(mockPopup);

      await service.update('popup-1', updateDto);

      const savedPopup = popupRepository.save.mock.calls[0][0];
      expect(savedPopup.startDate).toEqual(new Date('2024-06-01'));
      expect(savedPopup.endDate).toEqual(new Date('2024-06-30'));
    });

    it('should throw PopupException when popup not found', async () => {
      popupRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow('팝업을 찾을 수 없습니다.');
    });

    it('should throw CommonException when database error occurs', async () => {
      popupRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.update('popup-1', {})).rejects.toThrow(CommonException);
    });
  });

  describe('delete', () => {
    it('should delete popup successfully (soft delete)', async () => {
      popupRepository.findOne.mockResolvedValue(mockPopup);
      popupRepository.softRemove.mockResolvedValue(mockPopup);

      await service.delete('popup-1');

      expect(popupRepository.findOne).toHaveBeenCalledWith({ where: { id: 'popup-1' } });
      expect(popupRepository.softRemove).toHaveBeenCalledWith(mockPopup);
    });

    it('should throw PopupException when popup not found', async () => {
      popupRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow('팝업을 찾을 수 없습니다.');
    });

    it('should throw CommonException when database error occurs', async () => {
      popupRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('popup-1')).rejects.toThrow(CommonException);
    });
  });

  describe('toResponse (private method testing through public methods)', () => {
    it('should convert popup entity to response DTO correctly', async () => {
      const freshMockPopup = {
        id: 'popup-1',
        title: '중요 공지사항',
        content: '중요한 공지사항입니다.',
        imageUrl: 'https://example.com/popup.jpg',
        linkUrl: 'https://example.com/notice',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01T10:00:00.000Z'),
        isActive: true,
        priority: 1,
        createdById: 'user-1',
      } as any;
      
      popupRepository.findOne.mockResolvedValue(freshMockPopup);

      const result = await service.findOne('popup-1');

      expect(result).toEqual({
        id: 'popup-1',
        title: '중요 공지사항',
        content: '중요한 공지사항입니다.',
        imageUrl: 'https://example.com/popup.jpg',
        linkUrl: 'https://example.com/notice',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01T10:00:00.000Z'),
        isActive: true,
      });
    });
  });
});
