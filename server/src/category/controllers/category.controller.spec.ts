import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from '../services/category.service';
import { CategoryCreate, CategoryUpdate } from '../dto/category.dto';
import { AdminGuard } from '../../auth/guards/admin.guard';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: CategoryService;

  const mockCategoryService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const expectedCategories = [
        {
          id: 'cat-1',
          name: '공지사항',
          parentId: null,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat-2',
          name: '학사공지',
          parentId: 'cat-1',
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCategoryService.findAll.mockResolvedValue(expectedCategories);

      const result = await controller.getCategories();

      expect(categoryService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedCategories);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const createDto: CategoryCreate = {
        name: '새 카테고리',
        parentId: null,
        order: 1,
      };

      const expectedCategory = {
        id: 'new-cat-id',
        name: createDto.name,
        parentId: createDto.parentId,
        order: createDto.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryService.create.mockResolvedValue(expectedCategory);

      const result = await controller.createCategory(createDto);

      expect(categoryService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      const categoryId = 'cat-1';
      const updateDto: CategoryUpdate = {
        name: '수정된 카테고리',
        order: 2,
      };

      const expectedCategory = {
        id: categoryId,
        name: '수정된 카테고리',
        parentId: null,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoryService.update.mockResolvedValue(expectedCategory);

      const result = await controller.updateCategory(categoryId, updateDto);

      expect(categoryService.update).toHaveBeenCalledWith(
        categoryId,
        updateDto,
      );
      expect(result).toEqual(expectedCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const categoryId = 'cat-1';

      mockCategoryService.delete.mockResolvedValue(undefined);

      await controller.deleteCategory(categoryId);

      expect(categoryService.delete).toHaveBeenCalledWith(categoryId);
    });
  });
});
