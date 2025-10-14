import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { CategoryService } from '@/category/services/category.service';
import { Category } from '@/category/entities';
import { CommonException } from '@/common/exceptions';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: jest.Mocked<Repository<Category>>;

  const mockCategory = {
    id: 'cat-1',
    name: 'Test Category',
    slug: 'test-category',
    parentId: null,
    order: 0,
    createdAt: new Date('2024-01-01'),
    children: [],
  } as Category;

  const mockSubCategory = {
    id: 'cat-2',
    name: 'Sub Category',
    slug: 'sub-category',
    parentId: 'cat-1',
    order: 1,
    createdAt: new Date('2024-01-02'),
    children: [],
  } as Category;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get(getRepositoryToken(Category));

    // Reset all mocks before each test
    jest.clearAllMocks();

    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('findAll', () => {
    it('should return root categories when no parentId provided', async () => {
      categoryRepository.find.mockResolvedValue([mockCategory]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('cat-1');
      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { parentId: null },
        order: { order: 'ASC', createdAt: 'ASC' },
        select: ['id', 'name', 'slug', 'parentId', 'order', 'createdAt'],
      });
    });

    it('should return subcategories when parentId provided', async () => {
      categoryRepository.find.mockResolvedValue([mockSubCategory]);

      const result = await service.findAll('cat-1');

      expect(result).toHaveLength(1);
      expect(result[0].parentId).toBe('cat-1');
      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { parentId: 'cat-1' },
        order: { order: 'ASC', createdAt: 'ASC' },
        select: ['id', 'name', 'slug', 'parentId', 'order', 'createdAt'],
      });
    });

    it('should return empty array when no categories found', async () => {
      categoryRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toHaveLength(0);
    });

    it('should throw CommonException when database error occurs', async () => {
      categoryRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow(CommonException);
    });
  });

  describe('create', () => {
    it('should create root category successfully', async () => {
      const createDto = {
        name: 'New Category',
        order: 1,
      };

      categoryRepository.create.mockReturnValue(mockCategory);
      categoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(result.name).toBe('Test Category');
      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: 'New Category',
        parentId: undefined,
        order: 1,
      });
    });

    it('should create subcategory with valid parent', async () => {
      const createDto = {
        name: 'Sub Category',
        parentId: 'cat-1',
        order: 2,
      };

      categoryRepository.findOne.mockResolvedValue(mockCategory);
      categoryRepository.create.mockReturnValue(mockSubCategory);
      categoryRepository.save.mockResolvedValue(mockSubCategory);

      const result = await service.create(createDto);

      expect(result.parentId).toBe('cat-1');
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });

    it('should use default order 0 when not provided', async () => {
      const createDto = {
        name: 'New Category',
      };

      categoryRepository.create.mockReturnValue(mockCategory);
      categoryRepository.save.mockResolvedValue(mockCategory);

      await service.create(createDto);

      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: 'New Category',
        parentId: undefined,
        order: 0,
      });
    });

    it('should throw CategoryException when parent category not found', async () => {
      const createDto = {
        name: 'Sub Category',
        parentId: 'nonexistent',
      };

      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        '부모 카테고리를 찾을 수 없습니다',
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      const createDto = {
        name: 'New Category',
      };

      categoryRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createDto)).rejects.toThrow(CommonException);
    });
  });

  describe('update', () => {
    it('should update category successfully', async () => {
      const updateDto = {
        name: 'Updated Category',
        order: 5,
      };

      categoryRepository.findOne.mockResolvedValue(mockCategory);
      categoryRepository.save.mockResolvedValue({
        ...mockCategory,
        ...updateDto,
      } as any);

      const result = await service.update('cat-1', updateDto);

      expect(result.name).toBe('Updated Category');
      expect(categoryRepository.save).toHaveBeenCalled();
    });

    it('should update parent category when valid parent provided', async () => {
      const updateDto = {
        parentId: 'cat-2',
      };

      const parentCategory = { ...mockCategory, id: 'cat-2' } as any;

      categoryRepository.findOne
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(parentCategory);
      categoryRepository.save.mockResolvedValue({
        ...mockCategory,
        parentId: 'cat-2',
      } as any);

      const result = await service.update('cat-1', updateDto);

      expect(categoryRepository.findOne).toHaveBeenCalledTimes(2);
      expect(categoryRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: 'cat-2' },
      });
      expect(result).toBeDefined();
      expect(categoryRepository.save).toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const updateDto = {
        name: 'Updated Name',
      };

      categoryRepository.findOne.mockResolvedValue(mockCategory);
      categoryRepository.save.mockResolvedValue(mockCategory);

      await service.update('cat-1', updateDto);

      const savedCategory = categoryRepository.save.mock.calls[0][0];
      expect(savedCategory.name).toBe('Updated Name');
      expect(savedCategory.order).toBe(mockCategory.order); // unchanged
    });

    it('should throw CategoryException when category not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow(
        '카테고리를 찾을 수 없습니다',
      );
    });

    it('should throw CategoryException when new parent category not found', async () => {
      const updateDto = {
        parentId: 'nonexistent',
      };

      categoryRepository.findOne
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(null);

      await expect(service.update('cat-1', updateDto)).rejects.toThrow(
        '부모 카테고리를 찾을 수 없습니다',
      );
    });

    it('should not check parent when parentId unchanged', async () => {
      const updateDto = {
        name: 'Updated Name',
        parentId: null, // same as current
      };

      categoryRepository.findOne.mockResolvedValue(mockCategory);
      categoryRepository.save.mockResolvedValue(mockCategory);

      await service.update('cat-1', updateDto);

      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1); // only for category itself
    });

    it('should throw CommonException when database error occurs', async () => {
      categoryRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.update('cat-1', {})).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('delete', () => {
    it('should delete category without children successfully', async () => {
      categoryRepository.findOne.mockResolvedValue(mockCategory);
      categoryRepository.remove.mockResolvedValue(mockCategory);

      await service.delete('cat-1');

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        relations: ['children'],
      });
      expect(categoryRepository.remove).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw CategoryException when category not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        '카테고리를 찾을 수 없습니다',
      );
    });

    it('should throw CategoryException when category has children', async () => {
      const categoryWithChildren = {
        ...mockCategory,
        children: [mockSubCategory],
      } as any;

      categoryRepository.findOne.mockResolvedValue(categoryWithChildren);

      await expect(service.delete('cat-1')).rejects.toThrow(
        '하위 카테고리가 존재하는 카테고리는 삭제할 수 없습니다',
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      categoryRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('cat-1')).rejects.toThrow(CommonException);
    });
  });

  describe('toResponse (private method testing through public methods)', () => {
    it('should convert category entity to response DTO correctly', async () => {
      const freshMockCategory = {
        id: 'cat-1',
        name: 'Test Category',
        slug: 'test-category',
        parentId: null,
        order: 0,
        createdAt: new Date('2024-01-01'),
        children: [],
      } as Category;

      categoryRepository.find.mockResolvedValue([freshMockCategory]);

      const result = await service.findAll();

      expect(result[0]).toEqual({
        id: 'cat-1',
        name: 'Test Category',
        slug: 'test-category',
        parentId: null,
        order: 0,
        createdAt: new Date('2024-01-01'),
      });
    });
  });
});
