import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardPost } from '../entities';
import { User } from '../../auth/entities';
import { Category } from '../../category/entities';

describe('BoardService', () => {
  let service: BoardService;
  let categoryRepository: Repository<Category>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getOne: jest.fn(),
  };

  const mockPostRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getRepositoryToken(BoardPost),
          useValue: mockPostRepository,
        },
        {
          provide: 'PostFileRepository',
          useValue: {
            count: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    postRepository = module.get<Repository<BoardPost>>(
      getRepositoryToken(BoardPost),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated posts with author relation', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Post',
          categoryId: 'cat1',
          authorId: 'user1',
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: { username: 'testuser' },
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPosts, 1]);

      const result = await service.findAll({ page: 1, size: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].author).toBe('testuser');
      expect(result.meta.totalElements).toBe(1);
    });

    it('should filter by category', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ categoryName: '뉴스', page: 1, size: 10 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'category.name = :categoryName',
        { categoryName: '뉴스' },
      );
    });

    it('should search by keyword', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ keyword: 'test', page: 1, size: 10 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(post.title LIKE :keyword OR post.content LIKE :keyword)',
        { keyword: '%test%' },
      );
    });

    it('should sort by popularity', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ sort: 'popular', page: 1, size: 10 });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'post.viewCount',
        'DESC',
      );
    });
  });

  describe('findOne', () => {
    it('should return post with incremented view count and author', async () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        categoryId: 'cat1',
        authorId: 'user1',
        viewCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { username: 'testuser' },
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue({ ...mockPost, viewCount: 6 });

      const result = await service.findOne('1');

      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['author', 'category', 'files'],
      });
      expect(mockPostRepository.save).toHaveBeenCalledWith({
        ...mockPost,
        viewCount: 6,
      });
      expect(result.contentHtml).toBe('Test content');
      expect(result.author).toBe('testuser');
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create new post', async () => {
      const createDto = {
        title: 'New Post',
        contentHtml: 'New content',
        categoryName: '공지사항',
        thumbnailUrl: 'thumb.jpg',
      };

      const mockPost = {
        id: '1',
        ...createDto,
        content: createDto.contentHtml,
        authorId: 'user1',
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser = { username: 'testuser' };
      const mockCategory = { id: 'cat1', name: '공지사항' };
      const mockResult = { title: 'New Post', author: 'testuser' };

      mockPostRepository.create.mockReturnValue(mockPost);
      mockPostRepository.save.mockResolvedValue(mockPost);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (categoryRepository.findOne as jest.Mock).mockResolvedValue(mockCategory);

      // Spy on findOne method
      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult as any);

      const result = await service.create(createDto, 'user1');

      expect(result.title).toBe('New Post');
      expect(result.author).toBe('testuser');
    });
  });

  describe('update', () => {
    it('should update existing post with author relation', async () => {
      const updateDto = {
        title: 'Updated Post',
        contentHtml: 'Updated content',
      };

      const mockPost = {
        id: '1',
        title: 'Old Post',
        content: 'Old content',
        categoryId: 'cat1',
        authorId: 'user1',
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { username: 'testuser' },
      };

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue({
        ...mockPost,
        ...updateDto,
        content: updateDto.contentHtml,
      });

      const result = await service.update('1', updateDto);

      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['author'],
      });
      expect(result.title).toBe('Updated Post');
    });

    it('should throw NotFoundException when updating non-existent post', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete post', async () => {
      const mockPost = { id: '1', title: 'Test Post' };
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      await service.delete('1');

      expect(mockPostRepository.softRemove).toHaveBeenCalledWith(mockPost);
    });

    it('should throw NotFoundException when deleting non-existent post', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
