import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardPost, PostStatus } from '@/board/entities';
import { User } from '@/auth/entities';
import { Category } from '@/category/entities';
import { S3Service } from '@/file/services/s3.service';
import {
  PostCreateRequest,
  PostUpdateRequest,
  PostListQuery,
  AdminPostListQuery,
  PostResponse,
  PostDetailResponse,
  PostFileResponse,
} from '@/board/dto/post.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { File, OwnerType } from '@/file/entities';
import { CommonException, PostException } from '@/common/exceptions';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    @InjectRepository(BoardPost)
    private postRepository: Repository<BoardPost>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private s3Service: S3Service,
  ) {}

  /**
   * 공개 게시글 목록 조회 (일반 사용자용)
   * - 공개 상태(PUBLIC)인 게시글만 조회
   * - 카테고리별 필터링, 키워드 검색, 정렬 기능 제공
   * - 페이지네이션 적용
   * @param query 검색 조건 및 페이지 정보
   * @returns 페이지네이션된 게시글 목록
   */
  async findAll(query: PostListQuery): Promise<PagedResponse<PostResponse>> {
    try {
      this.logger.log(
        `Finding public posts with query: ${JSON.stringify(query)}`,
      );

      const { category, keyword, page = 1, size = 10, sort = 'latest' } = query;

      const queryBuilder = this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.category', 'category')
        .where('post.deletedAt IS NULL')
        .andWhere('post.status = :status', { status: PostStatus.PUBLIC })
        .groupBy('post.id')
        .addGroupBy('author.id')
        .addGroupBy('category.id');

      if (category) {
        queryBuilder.andWhere('category.slug = :category', { category });
        this.logger.debug(`Filtering by category: ${category}`);
      }

      if (keyword) {
        queryBuilder.andWhere(
          '(post.title LIKE :keyword OR post.content LIKE :keyword)',
          {
            keyword: `%${keyword}%`,
          },
        );
        this.logger.debug(`Searching with keyword: ${keyword}`);
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

      this.logger.log(
        `Found ${posts.length} posts out of ${totalElements} total`,
      );

      const postsWithFiles = await Promise.all(
        posts.map(async post => {
          const fileCount = await this.fileRepository.count({
            where: {
              ownerId: post.id,
              ownerType: OwnerType.POST,
            },
          });
          return { post, fileCount };
        }),
      );

      const items = postsWithFiles.map(({ post, fileCount }) =>
        this.toResponseWithFileCount(
          post,
          post.author?.username || 'Unknown',
          post.category?.name || 'Unknown',
          post.category?.slug || 'unknown',
          fileCount,
        ),
      );

      this.logger.log(
        `Successfully returned ${items.length} posts for page ${page}`,
      );
      return new PagedResponse(items, page, size, totalElements);
    } catch (error) {
      this.logger.error(`Error finding posts`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 관리자용 게시글 목록 조회
   * - 모든 상태의 게시글 조회 가능 (PUBLIC, DRAFT, PRIVATE)
   * - 상태별 필터링, 카테고리별 필터링, 키워드 검색 기능 제공
   * - 페이지네이션 적용
   * @param query 검색 조건 및 페이지 정보 (상태 필터 포함)
   * @returns 페이지네이션된 게시글 목록
   */
  async findAllForAdmin(
    query: AdminPostListQuery,
  ): Promise<PagedResponse<PostResponse>> {
    try {
      this.logger.log(
        `Admin finding posts with query: ${JSON.stringify(query)}`,
      );

      const {
        category,
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
        .where('post.deletedAt IS NULL')
        .groupBy('post.id')
        .addGroupBy('author.id')
        .addGroupBy('category.id');

      if (status) {
        queryBuilder.andWhere('post.status = :status', { status });
        this.logger.debug(`Admin filtering by status: ${status}`);
      }

      if (category) {
        queryBuilder.andWhere('category.slug = :category', { category });
        this.logger.debug(`Admin filtering by category: ${category}`);
      }

      if (keyword) {
        queryBuilder.andWhere(
          '(post.title LIKE :keyword OR post.content LIKE :keyword)',
          {
            keyword: `%${keyword}%`,
          },
        );
        this.logger.debug(`Admin searching with keyword: ${keyword}`);
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

      this.logger.log(
        `Admin found ${posts.length} posts out of ${totalElements} total`,
      );

      const postsWithFiles = await Promise.all(
        posts.map(async post => {
          const fileCount = await this.fileRepository.count({
            where: {
              ownerId: post.id,
              ownerType: OwnerType.POST,
            },
          });
          return { post, fileCount };
        }),
      );

      const items = postsWithFiles.map(({ post, fileCount }) =>
        this.toResponseWithFileCount(
          post,
          post.author?.username || 'Unknown',
          post.category?.name || 'Unknown',
          post.category?.slug || 'unknown',
          fileCount,
        ),
      );

      this.logger.log(
        `Admin successfully returned ${items.length} posts for page ${page}`,
      );
      return new PagedResponse(items, page, size, totalElements);
    } catch (error) {
      this.logger.error(`Error finding admin posts`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 게시글 상세 조회
   * - 게시글 내용, 첨부파일, 이전/다음 게시글 정보 포함
   * - 공개 게시글인 경우 조회수 자동 증가
   * - 관리자가 아닌 경우 공개 상태 게시글만 조회 가능
   * @param id 게시글 ID
   * @param isAdmin 관리자 여부 (기본값: false)
   * @returns 게시글 상세 정보 (이전/다음 게시글 포함)
   */
  async findOne(
    id: string,
    isAdmin: boolean = false,
  ): Promise<PostDetailResponse> {
    try {
      this.logger.log(`Finding post detail: ${id}, isAdmin: ${isAdmin}`);

      const queryBuilder = this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.category', 'category')
        .where('post.id = :id', { id });

      // 관리자가 아닌 경우 공개 게시글만 조회
      if (!isAdmin) {
        queryBuilder.andWhere('post.status = :status', {
          status: PostStatus.PUBLIC,
        });
      }

      const post = await queryBuilder.getOne();

      if (!post) {
        this.logger.warn(`Post not found: ${id}`);
        throw PostException.postNotFound(id);
      }

      this.logger.log(`Found post: ${post.title} (status: ${post.status})`);

      // 공개 게시글인 경우에만 조회수 증가
      if (post.status === PostStatus.PUBLIC) {
        const oldViewCount = post.viewCount;
        post.viewCount += 1;
        await this.postRepository.save(post);
        this.logger.debug(
          `View count increased: ${oldViewCount} -> ${post.viewCount}`,
        );
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
        prevQueryBuilder.andWhere('post.status = :status', {
          status: PostStatus.PUBLIC,
        });
        nextQueryBuilder.andWhere('post.status = :status', {
          status: PostStatus.PUBLIC,
        });
      }

      const prevPost = await prevQueryBuilder.getOne();
      const nextPost = await nextQueryBuilder.getOne();

      this.logger.debug(
        `Previous post: ${prevPost?.title || 'none'}, Next post: ${nextPost?.title || 'none'}`,
      );
      this.logger.log(`Successfully returned post detail: ${id}`);

      return {
        ...(await this.toDetailResponse(post)),
        prevPost: prevPost
          ? { id: prevPost.id, title: prevPost.title }
          : undefined,
        nextPost: nextPost
          ? { id: nextPost.id, title: nextPost.title }
          : undefined,
      };
    } catch (error) {
      this.logger.error(`Error finding post detail`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 새 게시글 작성
   * - 카테고리 유효성 검증
   * - 첨부파일 처리 (최대 10개)
   * - 게시글 상태 설정 (기본값: PUBLIC)
   * @param createDto 게시글 작성 데이터
   * @param authorId 작성자 ID
   * @returns 작성된 게시글 상세 정보
   */
  async create(
    createDto: PostCreateRequest,
    authorId: string,
  ): Promise<PostDetailResponse> {
    try {
      this.logger.log(
        `Creating new post: ${createDto.title} by author: ${authorId}`,
      );

      const category = await this.categoryRepository.findOne({
        where: { slug: createDto.category },
      });

      if (!category) {
        this.logger.error(`Category not found: ${createDto.category}`);
        throw PostException.categoryNotFound(createDto.category);
      }

      this.logger.debug(`Using category: ${category.name} (${category.slug})`);

      const post = this.postRepository.create({
        title: createDto.title,
        content: createDto.contentHtml,
        category: category,
        author: { id: authorId } as User,
        status: createDto.status || PostStatus.PUBLIC,
        thumbnailUrl: createDto.thumbnailUrl,
      });

      const saved = await this.postRepository.save(post);
      this.logger.log(`Post created successfully: ${saved.id}`);

      if (createDto.files && createDto.files.length > 0) {
        const fileCount = Math.min(createDto.files.length, 10);
        this.logger.debug(`Processing ${fileCount} files (max 10)`);

        const files = createDto.files.slice(0, 10).map((fileDto, index) =>
          this.fileRepository.create({
            ownerId: saved.id,
            ownerType: OwnerType.POST,
            fileKey: fileDto.fileKey,
            fileName: fileDto.originalName,
            fileSize: fileDto.fileSize,
            mimeType: fileDto.mimeType,
            displayOrder: index,
            createdById: authorId,
          }),
        );
        await this.fileRepository.save(files);
        this.logger.log(`Saved ${files.length} files for post: ${saved.id}`);
      }

      this.logger.log(
        `Successfully created post: ${saved.id} - ${saved.title}`,
      );
      return this.findOne(saved.id, true);
    } catch (error) {
      this.logger.error(`Error creating post`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 게시글 수정
   * - 기존 게시글 존재 여부 확인
   * - 카테고리 변경 시 유효성 검증
   * - 제공된 필드만 업데이트 (부분 업데이트)
   * @param id 게시글 ID
   * @param updateDto 수정할 데이터
   * @returns 수정된 게시글 상세 정보
   */
  async update(
    id: string,
    updateDto: PostUpdateRequest,
  ): Promise<PostDetailResponse> {
    try {
      this.logger.log(`Updating post: ${id}`);

      const post = await this.postRepository.findOne({
        where: { id },
        relations: ['author', 'category'],
      });
      if (!post) {
        this.logger.error(`Post not found for update: ${id}`);
        throw PostException.postNotFound(id);
      }

      this.logger.debug(`Found post to update: ${post.title}`);

      let category = post.category;

      if (updateDto.category) {
        const newCategory = await this.categoryRepository.findOne({
          where: { slug: updateDto.category },
        });

        if (!newCategory) {
          this.logger.error(
            `Category not found for update: ${updateDto.category}`,
          );
          throw PostException.categoryNotFound(updateDto.category);
        }

        category = newCategory;
        this.logger.debug(`Category changed to: ${category.name}`);
      }

      Object.assign(post, {
        title: updateDto.title ?? post.title,
        content: updateDto.contentHtml ?? post.content,
        category: category,
        status: updateDto.status ?? post.status,
        thumbnailUrl: updateDto.thumbnailUrl ?? post.thumbnailUrl,
      });

      const saved = await this.postRepository.save(post);
      this.logger.log(
        `Post updated successfully: ${saved.id} - ${saved.title}`,
      );

      return this.findOne(saved.id, true);
    } catch (error) {
      this.logger.error(`Error updating post`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 게시글 삭제 (소프트 삭제)
   * - 실제 데이터는 삭제하지 않고 deletedAt 필드만 설정
   * - 게시글 존재 여부 확인 후 삭제 처리
   * @param id 삭제할 게시글 ID
   */
  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting post: ${id}`);

      const post = await this.postRepository.findOne({ where: { id } });
      if (!post) {
        this.logger.error(`Post not found for deletion: ${id}`);
        throw PostException.postNotFound(id);
      }

      this.logger.debug(`Found post to delete: ${post.title}`);

      await this.postRepository.softRemove(post);
      this.logger.log(`Post soft deleted successfully: ${id} - ${post.title}`);
    } catch (error) {
      this.logger.error(`Error deleting post`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  /**
   * 게시글을 응답 DTO로 변환 (기본)
   * - 게시글 기본 정보를 클라이언트 응답 형태로 변환
   * @param post 게시글 엔티티
   * @param authorName 작성자명
   * @param categoryName 카테고리명
   * @param categorySlug 카테고리 슬러그
   * @returns 게시글 응답 DTO
   */
  private toResponse(
    post: BoardPost,
    authorName: string,
    categoryName: string,
    categorySlug: string,
  ): PostResponse {
    return {
      id: post.id,
      title: post.title,
      categoryName: categoryName,
      categorySlug: categorySlug,
      author: authorName,
      viewCount: post.viewCount,
      status: post.status,
      thumbnailUrl: post.thumbnailUrl,
      hasFiles: post.files ? post.files.length > 0 : false,
      fileCount: post.files ? post.files.length : 0,
      createdAt: post.createdAt,
    };
  }

  /**
   * 게시글을 응답 DTO로 변환 (파일 개수 포함)
   * - 별도로 조회한 파일 개수를 포함하여 응답 DTO 생성
   * - 목록 조회 시 성능 최적화를 위해 사용
   * @param post 게시글 엔티티
   * @param authorName 작성자명
   * @param categoryName 카테고리명
   * @param categorySlug 카테고리 슬러그
   * @param fileCount 첨부파일 개수
   * @returns 게시글 응답 DTO
   */
  private toResponseWithFileCount(
    post: BoardPost,
    authorName: string,
    categoryName: string,
    categorySlug: string,
    fileCount: number,
  ): PostResponse {
    return {
      id: post.id,
      title: post.title,
      categoryName: categoryName,
      categorySlug: categorySlug,
      author: authorName,
      viewCount: post.viewCount,
      status: post.status,
      thumbnailUrl: post.thumbnailUrl,
      hasFiles: fileCount > 0,
      fileCount: fileCount,
      createdAt: post.createdAt,
    };
  }

  /**
   * 게시글을 상세 응답 DTO로 변환
   * - 게시글 내용과 첨부파일 정보를 포함한 상세 응답 생성
   * - 첨부파일의 다운로드 URL 생성
   * @param post 게시글 엔티티
   * @returns 게시글 상세 응답 DTO
   */
  private async toDetailResponse(post: BoardPost): Promise<PostDetailResponse> {
    // 해당 게시글의 파일들을 별도로 조회
    const files = await this.fileRepository.find({
      where: {
        ownerId: post.id,
        ownerType: OwnerType.POST,
      },
      order: { displayOrder: 'ASC' },
    });

    const fileResponses: PostFileResponse[] = files.map(file => ({
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      downloadUrl: this.generateDownloadUrl(file.fileKey),
    }));

    return {
      ...this.toResponse(
        post,
        post.author.username,
        post.category.name,
        post.category.slug,
      ),
      contentHtml: post.content,
      files: fileResponses,
    };
  }

  /**
   * 파일 다운로드 URL 생성
   * - S3Service를 통해 파일 키로부터 접근 가능한 URL 생성
   * @param fileKey S3 파일 키
   * @returns 파일 다운로드 URL
   */
  private generateDownloadUrl(fileKey: string): string {
    return this.s3Service.getFileUrl(fileKey);
  }
}
