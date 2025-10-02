import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from '../services/board.service';
import { PostCreateRequest, PostUpdateRequest } from '../dto/post.dto';
import { AdminGuard } from '../../auth/guards/admin.guard';

describe('BoardController', () => {
  let controller: BoardController;
  let boardService: BoardService;

  const mockBoardService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
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
    it('should return paginated posts', async () => {
      const query = { page: 1, size: 10, categoryName: '공지사항' };
      const expectedResult = {
        items: [
          {
            id: 'post-1',
            title: '테스트 게시글',
            categoryId: 'cat-1',
            author: 'admin',
            viewCount: 0,
            thumbnailUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {
          page: 1,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        },
      };

      mockBoardService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getPosts(query);

      expect(boardService.findAll).toHaveBeenCalledWith({
        categoryName: '공지사항',
        page: 1,
        size: 10,
        keyword: undefined,
        sort: 'latest',
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPost', () => {
    it('should return a single post', async () => {
      const postId = 'post-1';
      const expectedPost = {
        id: postId,
        title: '테스트 게시글',
        contentHtml: '<p>테스트 내용</p>',
        categoryId: 'cat-1',
        author: 'admin',
        viewCount: 1,
        thumbnailUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        prevPost: null,
        nextPost: null,
      };

      mockBoardService.findOne.mockResolvedValue(expectedPost);

      const result = await controller.getPost(postId);

      expect(boardService.findOne).toHaveBeenCalledWith(postId);
      expect(result).toEqual(expectedPost);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const createDto: PostCreateRequest = {
        title: '새 게시글',
        contentHtml: '<p>새 게시글 내용</p>',
        categoryName: '공지사항',
        thumbnailUrl: null,
      };

      const mockRequest = { user: { id: 'user-1' } };
      const expectedPost = {
        id: 'new-post-id',
        title: createDto.title,
        contentHtml: createDto.contentHtml,
        categoryId: createDto.categoryName,
        author: 'admin',
        viewCount: 0,
        thumbnailUrl: createDto.thumbnailUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
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

      const expectedPost = {
        id: postId,
        title: '수정된 게시글',
        contentHtml: '<p>수정된 내용</p>',
        categoryId: 'cat-1',
        author: 'admin',
        viewCount: 0,
        thumbnailUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
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

      await controller.deletePost(postId);

      expect(boardService.delete).toHaveBeenCalledWith(postId);
    });
  });
});
