import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardController } from '@/board/controllers/board.controller';
import { BoardService } from '@/board/services/board.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { User } from '@/auth/entities';
import {
  PostCreateRequest,
  PostUpdateRequest,
  PostResponse,
  PostDetailResponse,
} from '@/board/dto/post.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { PostStatus } from '@/board/entities/board-post.entity';

describe('BoardController', () => {
  let controller: BoardController;
  let boardService: BoardService;

  const mockBoardService = {
    findAll: jest.fn(),
    findAllForAdmin: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<BoardController>(BoardController);
    boardService = module.get<BoardService>(BoardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should return paginated public posts', async () => {
      const rawQuery = {
        category: 'notices',
        page: '1',
        size: '10',
        sort: 'latest',
      };
      const expectedResult = new PagedResponse(
        [
          {
            id: 'post-1',
            title: '테스트 게시글',
            categoryName: '공지사항',
            categorySlug: 'notices',
            author: 'admin',
            viewCount: 0,
            status: PostStatus.PUBLIC,
            thumbnailUrl: null,
            hasFiles: false,
            fileCount: 0,
            createdAt: new Date(),
          } as PostResponse,
        ],
        1,
        10,
        1,
      );

      mockBoardService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getPosts(rawQuery);

      expect(boardService.findAll).toHaveBeenCalledWith({
        category: 'notices',
        keyword: undefined,
        page: 1,
        size: 10,
        sort: 'latest',
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPost', () => {
    it('should return a single public post', async () => {
      const postId = 'post-1';
      const expectedPost: PostDetailResponse = {
        id: postId,
        title: '테스트 게시글',
        contentHtml: '<p>테스트 내용</p>',
        categoryName: '공지사항',
        categorySlug: 'notices',
        author: 'admin',
        viewCount: 1,
        status: PostStatus.PUBLIC,
        thumbnailUrl: null,
        hasFiles: false,
        fileCount: 0,
        createdAt: new Date(),
        files: [],
        prevPost: null,
        nextPost: null,
      };

      mockBoardService.findOne.mockResolvedValue(expectedPost);

      const result = await controller.getPost(postId);

      expect(boardService.findOne).toHaveBeenCalledWith(postId, false);
      expect(result).toEqual(expectedPost);
    });
  });

  describe('getAdminPosts', () => {
    it('should return paginated admin posts', async () => {
      const rawQuery = {
        status: PostStatus.PUBLIC,
        category: 'notices',
        page: '1',
        size: '10',
        sort: 'latest',
      };
      const expectedResult = new PagedResponse(
        [
          {
            id: 'post-1',
            title: '관리자 게시글',
            categoryName: '공지사항',
            categorySlug: 'notices',
            author: 'admin',
            viewCount: 0,
            status: PostStatus.PUBLIC,
            thumbnailUrl: null,
            hasFiles: false,
            fileCount: 0,
            createdAt: new Date(),
          } as PostResponse,
        ],
        1,
        10,
        1,
      );

      mockBoardService.findAllForAdmin.mockResolvedValue(expectedResult);

      const result = await controller.getAdminPosts(rawQuery);

      expect(boardService.findAllForAdmin).toHaveBeenCalledWith({
        status: PostStatus.PUBLIC,
        category: 'notices',
        keyword: undefined,
        page: 1,
        size: 10,
        sort: 'latest',
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAdminPost', () => {
    it('should return a single admin post', async () => {
      const postId = 'post-1';
      const expectedPost: PostDetailResponse = {
        id: postId,
        title: '관리자 게시글',
        contentHtml: '<p>관리자 내용</p>',
        categoryName: '공지사항',
        categorySlug: 'notices',
        author: 'admin',
        viewCount: 1,
        status: PostStatus.PUBLIC,
        thumbnailUrl: null,
        hasFiles: false,
        fileCount: 0,
        createdAt: new Date(),
        files: [],
        prevPost: null,
        nextPost: null,
      };

      mockBoardService.findOne.mockResolvedValue(expectedPost);

      const result = await controller.getAdminPost(postId);

      expect(boardService.findOne).toHaveBeenCalledWith(postId, true);
      expect(result).toEqual(expectedPost);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const createDto: PostCreateRequest = {
        title: '새 게시글',
        contentHtml: '<p>새 게시글 내용</p>',
        category: 'notices',
        thumbnailUrl: null,
        status: PostStatus.PUBLIC,
      };

      const mockRequest = { user: { id: 'user-1' } };
      const expectedPost: PostDetailResponse = {
        id: 'new-post-id',
        title: createDto.title,
        contentHtml: createDto.contentHtml,
        categoryName: '공지사항',
        categorySlug: createDto.category,
        author: 'admin',
        viewCount: 0,
        status: PostStatus.PUBLIC,
        thumbnailUrl: createDto.thumbnailUrl,
        hasFiles: false,
        fileCount: 0,
        createdAt: new Date(),
        files: [],
        prevPost: null,
        nextPost: null,
      };

      mockBoardService.create.mockResolvedValue(expectedPost);

      const result = await controller.createPost(createDto, mockRequest);

      expect(boardService.create).toHaveBeenCalledWith(createDto, 'user-1');
      expect(result).toEqual(expectedPost);
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const postId = 'post-1';
      const updateDto: PostUpdateRequest = {
        title: '수정된 게시글',
        contentHtml: '<p>수정된 내용</p>',
      };

      const expectedPost: PostDetailResponse = {
        id: postId,
        title: '수정된 게시글',
        contentHtml: '<p>수정된 내용</p>',
        categoryName: '공지사항',
        categorySlug: 'notices',
        author: 'admin',
        viewCount: 0,
        status: PostStatus.PUBLIC,
        thumbnailUrl: null,
        hasFiles: false,
        fileCount: 0,
        createdAt: new Date(),
        files: [],
        prevPost: null,
        nextPost: null,
      };

      mockBoardService.update.mockResolvedValue(expectedPost);

      const result = await controller.updatePost(postId, updateDto);

      expect(boardService.update).toHaveBeenCalledWith(postId, updateDto);
      expect(result).toEqual(expectedPost);
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const postId = 'post-1';

      mockBoardService.delete.mockResolvedValue(undefined);

      const result = await controller.deletePost(postId);

      expect(boardService.delete).toHaveBeenCalledWith(postId);
      expect(result).toBeUndefined();
    });
  });
});
