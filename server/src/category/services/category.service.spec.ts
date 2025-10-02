import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../entities';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: any;

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all root categories ordered by displayOrder and createdAt', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: '공지사항',
          parentId: null,
          displayOrder: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'cat-2',
          name: '학사공지',
          parentId: null,
          displayOrder: 2,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { parentId: null },
        order: {
          displayOrder: 'ASC',
          createdAt: 'ASC',
        },
      });
      expect(result).toEqual(
        mockCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          parentId: cat.parentId,
          order: cat.displayOrder,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        })),
      );
    });

    it('should return subcategories when parentId is provided', async () => {
      const parentId = 'parent-cat-id';
      const mockCategories = [
        {
          id: 'sub-cat-1',
          name: '하위 카테고리 1',
          parentId: parentId,
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.findAll(parentId);

      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { parentId: parentId },
        order: {
          displayOrder: 'ASC',
          createdAt: 'ASC',
        },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create a new category successfully', async () => {
      const createDto = {
        name: '새 카테고리',
        parentId: null,
        order: 1,
      };

      const mockCategory = {
        id: 'new-cat-id',
        name: createDto.name,
        parentId: createDto.parentId,
        displayOrder: createDto.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        parentId: createDto.parentId,
        displayOrder: createDto.order || 0,
      });
      expect(categoryRepository.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual({
        id: mockCategory.id,
        name: mockCategory.name,
        parentId: mockCategory.parentId,
        order: mockCategory.displayOrder,
        createdAt: mockCategory.createdAt,
        updatedAt: mockCategory.updatedAt,
      });
    });

    it('should create category with parent validation', async () => {
      const createDto = {
        name: '하위 카테고리',
        parentId: 'parent-id',
        order: 1,
      };

      const mockParent = {
        id: 'parent-id',
        name: '부모 카테고리',
      };

      const mockCategory = {
        id: 'new-cat-id',
        name: createDto.name,
        parentId: createDto.parentId,
        displayOrder: createDto.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockParent);
      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.parentId },
      });
      expect(result.parentId).toBe(createDto.parentId);
    });

    it('should throw NotFoundException if parent category does not exist', async () => {
      const createDto = {
        name: '하위 카테고리',
        parentId: 'non-existent-parent',
        order: 1,
      };

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.parentId },
      });
    });
  });

  describe('update', () => {
    it('should update an existing category successfully', async () => {
      const categoryId = 'cat-1';
      const updateDto = {
        name: '수정된 카테고리',
        order: 2,
      };

      const existingCategory = {
        id: categoryId,
        name: '원래 카테고리',
        parentId: null,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedCategory = {
        ...existingCategory,
        name: updateDto.name,
        displayOrder: updateDto.order,
        updatedAt: new Date(),
      };

      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, updateDto);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(categoryRepository.save).toHaveBeenCalledWith({
        ...existingCategory,
        name: updateDto.name,
        parentId: existingCategory.parentId,
        displayOrder: updateDto.order,
      });
      expect(result).toEqual({
        id: updatedCategory.id,
        name: updatedCategory.name,
        parentId: updatedCategory.parentId,
        order: updatedCategory.displayOrder,
        createdAt: updatedCategory.createdAt,
        updatedAt: updatedCategory.updatedAt,
      });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const categoryId = 'non-existent-id';
      const updateDto = { name: '수정된 카테고리' };

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.update(categoryId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });
  });

  describe('delete', () => {
    it('should delete a category successfully', async () => {
      const categoryId = 'cat-1';
      const existingCategory = {
        id: categoryId,
        name: '삭제할 카테고리',
        children: [], // No children
      };

      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);
      mockCategoryRepository.remove.mockResolvedValue(existingCategory);

      await service.delete(categoryId);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: ['children'],
      });
      expect(categoryRepository.remove).toHaveBeenCalledWith(existingCategory);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const categoryId = 'non-existent-id';

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(categoryId)).rejects.toThrow(
        NotFoundException,
      );
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: ['children'],
      });
    });

    it('should throw ConflictException if category has children', async () => {
      const categoryId = 'cat-1';
      const existingCategory = {
        id: categoryId,
        name: '부모 카테고리',
        children: [{ id: 'child-1', name: '자식 카테고리' }],
      };

      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);

      await expect(service.delete(categoryId)).rejects.toThrow(
        ConflictException,
      );
      expect(categoryRepository.remove).not.toHaveBeenCalled();
    });
  });
});
