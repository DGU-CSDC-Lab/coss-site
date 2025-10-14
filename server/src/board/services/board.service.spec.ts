import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BoardService } from '@/board/services/board.service';
import { BoardPost, PostStatus } from '@/board/entities';
import { User } from '@/auth/entities';
import { Category } from '@/category/entities';
import { File, OwnerType } from '@/file/entities';
import { S3Service } from '@/file/services/s3.service';
import { CommonException } from '@/common/exceptions';
import { PagedResponse } from '@/common/dto/response.dto';

describe('BoardService', () => {
  let service: BoardService;
  let postRepository: jest.Mocked<Repository<BoardPost>>;
  let fileRepository: jest.Mocked<Repository<File>>;
  let categoryRepository: jest.Mocked<Repository<Category>>;
  let s3Service: jest.Mocked<S3Service>;

  const mockUser = {
    id: 'user-1',
    username: 'testuser',
  } as User;

  const mockCategory = {
    id: 'cat-1',
    name: 'Test Category',
    slug: 'test-category',
  } as Category;

  const mockPost = {
    id: 'post-1',
    title: 'Test Post',
    content: '<p>Test content</p>',
    status: PostStatus.PUBLIC,
    viewCount: 10,
    thumbnailUrl: 'https://example.com/thumb.jpg',
    author: mockUser,
    category: mockCategory,
    files: [],
    createdAt: new Date('2024-01-01'),
  } as BoardPost;

  const mockFile = {
    id: 'file-1',
    ownerId: 'post-1',
    ownerType: OwnerType.POST,
    fileKey: 'test-file-key',
    fileName: 'test.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    displayOrder: 0,
  } as File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getRepositoryToken(BoardPost),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softRemove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(File),
          useValue: {
            find: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            getFileUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    postRepository = module.get(getRepositoryToken(BoardPost));
    fileRepository = module.get(getRepositoryToken(File));
    categoryRepository = module.get(getRepositoryToken(Category));
    s3Service = module.get(S3Service);

    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('findAll', () => {
    it('should return paginated public posts successfully', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPost], 1]),
      };

      postRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );
      fileRepository.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, size: 10 });

      expect(result).toBeInstanceOf(PagedResponse);
      expect(result.items).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'post.status = :status',
        { status: PostStatus.PUBLIC },
      );
    });

    it('should filter by category when provided', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      postRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.findAll({ category: 'test-category' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'category.slug = :category',
        { category: 'test-category' },
      );
    });

    it('should search by keyword when provided', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      postRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.findAll({ keyword: 'test' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(post.title LIKE :keyword OR post.content LIKE :keyword)',
        { keyword: '%test%' },
      );
    });

    it('should sort by popular when specified', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      postRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.findAll({ sort: 'popular' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'post.viewCount',
        'DESC',
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      postRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findAll({})).rejects.toThrow(CommonException);
    });
  });

  describe('findAllForAdmin', () => {
    it('should return all posts for admin without status filter', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPost], 1]),
      };

      postRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );
      fileRepository.count.mockResolvedValue(0);

      const result = await service.findAllForAdmin({});

      expect(result).toBeInstanceOf(PagedResponse);
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
        'post.status = :status',
        expect.any(Object),
      );
    });

    it('should filter by status when provided', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      postRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.findAllForAdmin({ status: PostStatus.DRAFT });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'post.status = :status',
        { status: PostStatus.DRAFT },
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      postRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findAllForAdmin({})).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('findOne', () => {
    it('should return post detail and increment view count for public post', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockPost),
      };

      const mockPrevNextQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      postRepository.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder as any)
        .mockReturnValue(mockPrevNextQueryBuilder as any);
      postRepository.save.mockResolvedValue({
        ...mockPost,
        viewCount: 11,
      } as BoardPost);
      fileRepository.find.mockResolvedValue([mockFile]);
      s3Service.getFileUrl.mockReturnValue('https://example.com/download');

      const result = await service.findOne('post-1');

      expect(result.id).toBe('post-1');
      expect(postRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ viewCount: 11 }),
      );
    });

    it('should return post detail without incrementing view count for admin', async () => {
      const draftPost = { ...mockPost, status: PostStatus.DRAFT };
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(draftPost),
      };

      const mockPrevNextQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      postRepository.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder as any)
        .mockReturnValue(mockPrevNextQueryBuilder as any);
      fileRepository.find.mockResolvedValue([mockFile]);

      const result = await service.findOne('post-1', true);

      expect(result.id).toBe('post-1');
      expect(postRepository.save).not.toHaveBeenCalled();
    });

    it('should throw PostException when post not found', async () => {
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      postRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        '게시글을 찾을 수 없습니다',
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      postRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findOne('post-1')).rejects.toThrow(CommonException);
    });
  });

  describe('create', () => {
    it('should create post successfully', async () => {
      const createDto = {
        title: 'New Post',
        contentHtml: '<p>Content</p>',
        category: 'test-category',
        status: PostStatus.PUBLIC,
      };

      categoryRepository.findOne.mockResolvedValue(mockCategory);
      postRepository.create.mockReturnValue(mockPost);
      postRepository.save.mockResolvedValue(mockPost);

      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'post-1',
        title: 'New Post',
        contentHtml: '<p>Content</p>',
        files: [],
      } as any);

      const result = await service.create(createDto, 'user-1');

      expect(result.id).toBe('post-1');
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-category' },
      });
    });

    it('should create post with files', async () => {
      const createDto = {
        title: 'New Post',
        contentHtml: '<p>Content</p>',
        category: 'test-category',
        files: [
          {
            fileKey: 'file-key-1',
            originalName: 'test.pdf',
            fileSize: 1024,
            mimeType: 'application/pdf',
          },
        ],
      };

      categoryRepository.findOne.mockResolvedValue(mockCategory);
      postRepository.create.mockReturnValue(mockPost);
      postRepository.save.mockResolvedValue(mockPost);
      fileRepository.create.mockReturnValue(mockFile);
      fileRepository.save.mockResolvedValue([mockFile] as any);

      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'post-1',
        files: [mockFile],
      } as any);

      const result = await service.create(createDto, 'user-1');

      expect(result.id).toBe('post-1');
      expect(result.files).toHaveLength(1);
      expect(fileRepository.save).toHaveBeenCalled();
    });

    it('should throw PostException when category not found', async () => {
      const createDto = {
        title: 'New Post',
        contentHtml: '<p>Content</p>',
        category: 'nonexistent',
      };

      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        '카테고리를 찾을 수 없습니다',
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      const createDto = {
        title: 'New Post',
        contentHtml: '<p>Content</p>',
        category: 'test-category',
      };

      categoryRepository.findOne.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('update', () => {
    it('should update post successfully', async () => {
      const updateDto = {
        title: 'Updated Title',
        contentHtml: '<p>Updated content</p>',
      };

      postRepository.findOne.mockResolvedValue(mockPost);
      postRepository.save.mockResolvedValue({
        ...mockPost,
        ...updateDto,
      } as any);

      jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'post-1',
        title: 'Updated Title',
      } as any);

      const result = await service.update('post-1', updateDto);

      expect(result.title).toBe('Updated Title');
    });

    it('should update post category', async () => {
      const updateDto = {
        category: 'new-category',
      };

      const newCategory = {
        ...mockCategory,
        slug: 'new-category',
        name: 'New Category',
      } as Category;

      postRepository.findOne.mockResolvedValue(mockPost);
      categoryRepository.findOne.mockResolvedValue(newCategory);
      postRepository.save.mockResolvedValue(mockPost);

      jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'post-1' } as any);

      await service.update('post-1', updateDto);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'new-category' },
      });
    });

    it('should throw PostException when post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow(
        '게시글을 찾을 수 없습니다',
      );
    });

    it('should throw PostException when category not found', async () => {
      const updateDto = { category: 'nonexistent' };

      postRepository.findOne.mockResolvedValue(mockPost);
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.update('post-1', updateDto)).rejects.toThrow(
        '카테고리를 찾을 수 없습니다',
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      postRepository.findOne.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.update('post-1', {})).rejects.toThrow(
        CommonException,
      );
    });
  });

  describe('delete', () => {
    it('should delete post successfully', async () => {
      postRepository.findOne.mockResolvedValue(mockPost);
      postRepository.softRemove.mockResolvedValue(mockPost);

      await service.delete('post-1');

      expect(postRepository.softRemove).toHaveBeenCalledWith(mockPost);
    });

    it('should throw PostException when post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        '게시글을 찾을 수 없습니다',
      );
    });

    it('should throw CommonException when database error occurs', async () => {
      postRepository.findOne.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.delete('post-1')).rejects.toThrow(CommonException);
    });
  });
});
