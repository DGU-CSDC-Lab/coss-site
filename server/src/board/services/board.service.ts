import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardPost, PostFile, PostStatus } from '../entities';
import { User } from '../../auth/entities';
import { Category } from '../../category/entities';
import {
  PostCreateRequest,
  PostUpdateRequest,
  PostListQuery,
  AdminPostListQuery,
  PostResponse,
  PostDetailResponse,
  PostFileResponse,
} from '../dto/post.dto';
import { PagedResponse } from '../../common/dto/response.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardPost)
    private postRepository: Repository<BoardPost>,
    @InjectRepository(PostFile)
    private postFileRepository: Repository<PostFile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // 공개 게시글 조회 (기본)
  async findAll(query: PostListQuery): Promise<PagedResponse<PostResponse>> {
    const {
      categoryName,
      keyword,
      page = 1,
      size = 10,
      sort = 'latest',
    } = query;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoin('post.files', 'files')
      .where('post.deletedAt IS NULL')
      .andWhere('post.status = :status', { status: PostStatus.PUBLIC })
      .groupBy('post.id')
      .addGroupBy('author.id')
      .addGroupBy('category.id');

    if (categoryName) {
      queryBuilder.andWhere('category.name = :categoryName', { categoryName });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(post.title LIKE :keyword OR post.content LIKE :keyword)',
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    if (sort === 'popular') {
      queryBuilder.orderBy('post.viewCount', 'DESC');
    } else {
      queryBuilder.orderBy('post.createdAt', 'DESC');
    }

    const [posts, totalElements] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const postsWithFiles = await Promise.all(
      posts.map(async post => {
        const fileCount = await this.postFileRepository.count({
          where: { postId: post.id },
        });
        return { post, fileCount };
      }),
    );

    const items = postsWithFiles.map(({ post, fileCount }) =>
      this.toResponseWithFileCount(
        post,
        post.author?.username || 'Unknown',
        post.category?.name || 'Unknown',
        fileCount,
      ),
    );
    return new PagedResponse(items, page, size, totalElements);
  }

  // 관리자 전용 게시글 조회 (상태별 필터링 가능)
  async findAllForAdmin(query: AdminPostListQuery): Promise<PagedResponse<PostResponse>> {
    const {
      categoryName,
      keyword,
      status,
      page = 1,
      size = 10,
      sort = 'latest',
    } = query;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoin('post.files', 'files')
      .where('post.deletedAt IS NULL')
      .groupBy('post.id')
      .addGroupBy('author.id')
      .addGroupBy('category.id');

    if (status) {
      queryBuilder.andWhere('post.status = :status', { status });
    }

    if (categoryName) {
      queryBuilder.andWhere('category.name = :categoryName', { categoryName });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(post.title LIKE :keyword OR post.content LIKE :keyword)',
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    if (sort === 'popular') {
      queryBuilder.orderBy('post.viewCount', 'DESC');
    } else {
      queryBuilder.orderBy('post.createdAt', 'DESC');
    }

    const [posts, totalElements] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const postsWithFiles = await Promise.all(
      posts.map(async post => {
        const fileCount = await this.postFileRepository.count({
          where: { postId: post.id },
        });
        return { post, fileCount };
      }),
    );

    const items = postsWithFiles.map(({ post, fileCount }) =>
      this.toResponseWithFileCount(
        post,
        post.author?.username || 'Unknown',
        post.category?.name || 'Unknown',
        fileCount,
      ),
    );
    return new PagedResponse(items, page, size, totalElements);
  }

  async findOne(id: string, isAdmin: boolean = false): Promise<PostDetailResponse> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.files', 'files')
      .where('post.id = :id', { id });

    // 관리자가 아닌 경우 공개 게시글만 조회
    if (!isAdmin) {
      queryBuilder.andWhere('post.status = :status', { status: PostStatus.PUBLIC });
    }

    const post = await queryBuilder.getOne();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // 공개 게시글인 경우에만 조회수 증가
    if (post.status === PostStatus.PUBLIC) {
      post.viewCount += 1;
      await this.postRepository.save(post);
    }

    // 같은 카테고리의 이전/다음 게시글 조회
    const prevQueryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.category', 'category')
      .where('category.id = :categoryId', { categoryId: post.category.id })
      .andWhere('post.id != :currentId', { currentId: post.id })
      .andWhere('post.createdAt < :createdAt', { createdAt: post.createdAt })
      .orderBy('post.createdAt', 'DESC')
      .select(['post.id', 'post.title']);

    const nextQueryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.category', 'category')
      .where('category.id = :categoryId', { categoryId: post.category.id })
      .andWhere('post.id != :currentId', { currentId: post.id })
      .andWhere('post.createdAt > :createdAt', { createdAt: post.createdAt })
      .orderBy('post.createdAt', 'ASC')
      .select(['post.id', 'post.title']);

    // 관리자가 아닌 경우에만 상태 조건 추가
    if (!isAdmin) {
      prevQueryBuilder.andWhere('post.status = :status', { status: PostStatus.PUBLIC });
      nextQueryBuilder.andWhere('post.status = :status', { status: PostStatus.PUBLIC });
    }

    const prevPost = await prevQueryBuilder.getOne();
    const nextPost = await nextQueryBuilder.getOne();

    return {
      ...this.toDetailResponse(post),
      prevPost: prevPost
        ? { id: prevPost.id, title: prevPost.title }
        : undefined,
      nextPost: nextPost
        ? { id: nextPost.id, title: nextPost.title }
        : undefined,
    };
  }

  async create(
    createDto: PostCreateRequest,
    authorId: string,
  ): Promise<PostDetailResponse> {
    const category = await this.categoryRepository.findOne({
      where: { name: createDto.categoryName },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with name '${createDto.categoryName}' not found`,
      );
    }

    const post = this.postRepository.create({
      title: createDto.title,
      content: createDto.contentHtml,
      category: category,
      authorId,
      status: createDto.status || PostStatus.PUBLIC,
      thumbnailUrl: createDto.thumbnailUrl,
    });

    const saved = await this.postRepository.save(post);

    if (createDto.files && createDto.files.length > 0) {
      const files = createDto.files.slice(0, 10).map((fileDto, index) =>
        this.postFileRepository.create({
          postId: saved.id,
          fileKey: fileDto.fileKey,
          originalName: fileDto.originalName,
          fileSize: fileDto.fileSize,
          mimeType: fileDto.mimeType,
          displayOrder: index,
        }),
      );
      await this.postFileRepository.save(files);
    }

    return this.findOne(saved.id, true);
  }

  async update(
    id: string,
    updateDto: PostUpdateRequest,
  ): Promise<PostDetailResponse> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // 임시저장 상태에서는 수정할 수 없음 (임시저장은 생성 시에만 가능)
    if (post.status === PostStatus.DRAFT && updateDto.status) {
      throw new ForbiddenException('Draft posts cannot be updated to other status');
    }

    let category = post.category;

    if (updateDto.categoryName) {
      const newCategory = await this.categoryRepository.findOne({
        where: { name: updateDto.categoryName },
      });

      if (!newCategory) {
        throw new NotFoundException(
          `Category with name '${updateDto.categoryName}' not found`,
        );
      }

      category = newCategory;
    }

    Object.assign(post, {
      title: updateDto.title ?? post.title,
      content: updateDto.contentHtml ?? post.content,
      category: category,
      status: updateDto.status ?? post.status,
      thumbnailUrl: updateDto.thumbnailUrl ?? post.thumbnailUrl,
    });

    const saved = await this.postRepository.save(post);

    return this.findOne(saved.id, true);
  }

  async delete(id: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.postRepository.softRemove(post);
  }

  private toResponse(
    post: BoardPost,
    authorName: string,
    categoryName: string,
  ): PostResponse {
    return {
      id: post.id,
      title: post.title,
      categoryId: post.category?.id || '',
      categoryName: categoryName,
      author: authorName,
      viewCount: post.viewCount,
      status: post.status,
      thumbnailUrl: post.thumbnailUrl,
      hasFiles: post.files ? post.files.length > 0 : false,
      fileCount: post.files ? post.files.length : 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private toResponseWithFileCount(
    post: BoardPost,
    authorName: string,
    categoryName: string,
    fileCount: number,
  ): PostResponse {
    return {
      id: post.id,
      title: post.title,
      categoryId: post.category?.id || '',
      categoryName: categoryName,
      author: authorName,
      viewCount: post.viewCount,
      status: post.status,
      thumbnailUrl: post.thumbnailUrl,
      hasFiles: fileCount > 0,
      fileCount: fileCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private toDetailResponse(post: BoardPost): PostDetailResponse {
    const files: PostFileResponse[] =
      post.files?.map(file => ({
        id: file.id,
        originalName: file.originalName,
        fileSize: file.fileSize,
        downloadUrl: this.generateDownloadUrl(file.fileKey),
      })) || [];

    return {
      ...this.toResponse(
        post,
        post.author?.username || 'Unknown',
        post.category?.name || 'Unknown',
      ),
      contentHtml: post.content,
      files,
    };
  }

  private generateDownloadUrl(fileKey: string): string {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION;
    return `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600`;
  }
}
