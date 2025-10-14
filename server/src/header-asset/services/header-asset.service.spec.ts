import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { HeaderAssetService } from '@/header-asset/services/header-asset.service';
import { HeaderAsset } from '@/header-asset/entities';
import { CommonException } from '@/common/exceptions';
import { PagedResponse } from '@/common/dto/response.dto';

describe('HeaderAssetService', () => {
  let service: HeaderAssetService;
  let headerAssetRepository: jest.Mocked<Repository<HeaderAsset>>;

  const mockHeaderAsset = {
    id: 'asset-1',
    title: '메인 배너',
    imageUrl: 'https://example.com/banner.jpg',
    linkUrl: 'https://example.com/main',
    isActive: true,
    createdById: 'user-1',
    createdAt: new Date('2024-01-01'),
    deletedAt: null,
  } as any;

  const mockHeaderAsset2 = {
    id: 'asset-2',
    title: '이벤트 배너',
    imageUrl: 'https://example.com/event.jpg',
    linkUrl: 'https://example.com/event',
    isActive: false,
    createdById: 'user-2',
    createdAt: new Date('2024-01-02'),
    deletedAt: null,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeaderAssetService,
        {
          provide: getRepositoryToken(HeaderAsset),
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

    service = module.get<HeaderAssetService>(HeaderAssetService);
    headerAssetRepository = module.get(getRepositoryToken(HeaderAsset));

    jest.clearAllMocks();

    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('findAll', () => {
    it('should return paginated header assets successfully', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([[mockHeaderAsset, mockHeaderAsset2], 2]),
      };

      headerAssetRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findAll({ page: 1, size: 10 });

      expect(result).toBeInstanceOf(PagedResponse);
      expect(result.items).toHaveLength(2);
      expect(result.meta.totalElements).toBe(2);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'asset.deletedAt IS NULL',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'asset.createdAt',
        'DESC',
      );
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
        getManyAndCount: jest.fn().mockResolvedValue([[mockHeaderAsset], 1]),
      };

      headerAssetRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.findAll({ isActive: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'asset.isActive = :isActive',
        { isActive: true },
      );
    });

    it('should return empty results when no header assets found', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      headerAssetRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findAll({});

      expect(result.items).toHaveLength(0);
      expect(result.meta.totalElements).toBe(0);
    });

    it('should throw CommonException when database error occurs', async () => {
      headerAssetRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findAll({})).rejects.toThrow(CommonException);
    });
  });

  describe('findOne', () => {
    it('should return header asset by id successfully', async () => {
      headerAssetRepository.findOne.mockResolvedValue(mockHeaderAsset);

      const result = await service.findOne('asset-1');

      expect(result.id).toBe('asset-1');
      expect(result.title).toBe('메인 배너');
      expect(headerAssetRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'asset-1', deletedAt: null },
      });
    });

    it('should throw HeaderAssetException when header asset not found', async () => {
      headerAssetRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        '헤더 에셋을 찾을 수 없습니다',
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      headerAssetRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findOne('asset-1')).rejects.toThrow(CommonException);
    });
  });

  describe('create', () => {
    it('should create header asset successfully', async () => {
      const createDto = {
        title: '새로운 배너',
        imageUrl: 'https://example.com/new.jpg',
        linkUrl: 'https://example.com/new',
        isActive: true,
      };

      headerAssetRepository.create.mockReturnValue(mockHeaderAsset);
      headerAssetRepository.save.mockResolvedValue(mockHeaderAsset);

      const result = await service.create(createDto, 'user-1');

      expect(result.id).toBe('asset-1');
      expect(headerAssetRepository.create).toHaveBeenCalledWith({
        ...createDto,
        createdById: 'user-1',
      });
      expect(headerAssetRepository.save).toHaveBeenCalled();
    });

    it('should create header asset without optional linkUrl', async () => {
      const createDto = {
        title: '새로운 배너',
        imageUrl: 'https://example.com/new.jpg',
        linkUrl: '',
        isActive: true,
      };

      headerAssetRepository.create.mockReturnValue(mockHeaderAsset);
      headerAssetRepository.save.mockResolvedValue(mockHeaderAsset);

      const result = await service.create(createDto, 'user-1');

      expect(result.id).toBe('asset-1');
      expect(headerAssetRepository.create).toHaveBeenCalledWith({
        ...createDto,
        createdById: 'user-1',
      });
    });

    it('should throw CommonException when database error occurs', async () => {
      const createDto = {
        title: '새로운 배너',
        imageUrl: 'https://example.com/new.jpg',
        linkUrl: 'https://example.com/new',
        isActive: true,
      };

      headerAssetRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('update', () => {
    it('should update header asset successfully', async () => {
      const updateDto = {
        title: '수정된 제목',
        imageUrl: 'https://example.com/updated.jpg',
      };

      headerAssetRepository.findOne.mockResolvedValue(mockHeaderAsset);
      headerAssetRepository.save.mockResolvedValue({
        ...mockHeaderAsset,
        ...updateDto,
      } as any);

      const result = await service.update('asset-1', updateDto);

      expect(result.title).toBe('수정된 제목');
      expect(headerAssetRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'asset-1', deletedAt: null },
      });
      expect(headerAssetRepository.save).toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const updateDto = {
        title: '새 제목',
      };

      headerAssetRepository.findOne.mockResolvedValue(mockHeaderAsset);
      headerAssetRepository.save.mockResolvedValue(mockHeaderAsset);

      await service.update('asset-1', updateDto);

      const savedAsset = headerAssetRepository.save.mock.calls[0][0];
      expect(savedAsset.title).toBe('새 제목');
      expect(savedAsset.imageUrl).toBe(mockHeaderAsset.imageUrl); // unchanged
    });

    it('should update isActive status', async () => {
      const updateDto = {
        isActive: false,
      };

      headerAssetRepository.findOne.mockResolvedValue(mockHeaderAsset);
      headerAssetRepository.save.mockResolvedValue(mockHeaderAsset);

      await service.update('asset-1', updateDto);

      const savedAsset = headerAssetRepository.save.mock.calls[0][0];
      expect(savedAsset.isActive).toBe(false);
    });

    it('should update linkUrl to null', async () => {
      const updateDto = {
        linkUrl: null,
      };

      headerAssetRepository.findOne.mockResolvedValue(mockHeaderAsset);
      headerAssetRepository.save.mockResolvedValue(mockHeaderAsset);

      await service.update('asset-1', updateDto);

      const savedAsset = headerAssetRepository.save.mock.calls[0][0];
      expect(savedAsset.linkUrl).toBe(null);
    });

    it('should throw HeaderAssetException when header asset not found', async () => {
      headerAssetRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow(
        '헤더 에셋을 찾을 수 없습니다',
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      headerAssetRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.update('asset-1', {})).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('delete', () => {
    it('should delete header asset successfully (soft delete)', async () => {
      headerAssetRepository.findOne.mockResolvedValue(mockHeaderAsset);
      headerAssetRepository.softRemove.mockResolvedValue(mockHeaderAsset);

      await service.delete('asset-1');

      expect(headerAssetRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'asset-1', deletedAt: null },
      });
      expect(headerAssetRepository.softRemove).toHaveBeenCalledWith(
        mockHeaderAsset,
      );
    });

    it('should throw HeaderAssetException when header asset not found', async () => {
      headerAssetRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        '헤더 에셋을 찾을 수 없습니다',
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      headerAssetRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.delete('asset-1')).rejects.toThrow(CommonException);
    });
  });

  describe('toResponse (private method testing through public methods)', () => {
    it('should convert header asset entity to response DTO correctly', async () => {
      const freshMockAsset = {
        id: 'asset-1',
        title: '메인 배너',
        imageUrl: 'https://example.com/banner.jpg',
        linkUrl: 'https://example.com/main',
        isActive: true,
        createdById: 'user-1',
        createdAt: new Date('2024-01-01'),
        deletedAt: null,
      } as any;

      headerAssetRepository.findOne.mockResolvedValue(freshMockAsset);

      const result = await service.findOne('asset-1');

      expect(result).toEqual({
        id: 'asset-1',
        title: '메인 배너',
        imageUrl: 'https://example.com/banner.jpg',
        linkUrl: 'https://example.com/main',
        isActive: true,
      });
    });
  });
});
