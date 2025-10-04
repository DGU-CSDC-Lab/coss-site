import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardPost, PostFile } from '../entities';
import { User } from '../../auth/entities';
import { Category } from '../../category/entities';
import {
  PostCreateRequest,
  PostUpdateRequest,
  PostListQuery,
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

    // Get file counts separately
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

  async findOne(id: string): Promise<PostDetailResponse> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'files'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Increment view count
    post.viewCount += 1;
    await this.postRepository.save(post);

    // Get prev/next posts in same category by creation time
    const prevPost = await this.postRepository
      .createQueryBuilder('post')
      .where('post.categoryId = :categoryId', { categoryId: post.categoryId })
      .andWhere('post.id != :currentId', { currentId: post.id })
      .andWhere('post.createdAt < :createdAt', { createdAt: post.createdAt })
      .orderBy('post.createdAt', 'DESC')
      .select(['post.id', 'post.title'])
      .getOne();

    const nextPost = await this.postRepository
      .createQueryBuilder('post')
      .where('post.categoryId = :categoryId', { categoryId: post.categoryId })
      .andWhere('post.id != :currentId', { currentId: post.id })
      .andWhere('post.createdAt > :createdAt', { createdAt: post.createdAt })
      .orderBy('post.createdAt', 'ASC')
      .select(['post.id', 'post.title'])
      .getOne();

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
    // categoryName으로 categoryId 찾기
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
      categoryId: category.id,
      authorId,
      thumbnailUrl: createDto.thumbnailUrl,
    });

    const saved = await this.postRepository.save(post);

    // Handle file attachments
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

    return this.findOne(saved.id);
  }

  async update(
    id: string,
    updateDto: PostUpdateRequest,
  ): Promise<PostDetailResponse> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    let categoryId = post.categoryId;

    // categoryName이 제공된 경우 categoryId로 변환
    if (updateDto.categoryName) {
      const category = await this.categoryRepository.findOne({
        where: { name: updateDto.categoryName },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with name '${updateDto.categoryName}' not found`,
        );
      }

      categoryId = category.id;
    }

    Object.assign(post, {
      title: updateDto.title ?? post.title,
      content: updateDto.contentHtml ?? post.content,
      categoryId: categoryId,
      thumbnailUrl: updateDto.thumbnailUrl ?? post.thumbnailUrl,
    });

    const saved = await this.postRepository.save(post);

    return this.findOne(saved.id);
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
      categoryId: post.categoryId,
      categoryName: categoryName,
      author: authorName,
      viewCount: post.viewCount,
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
      categoryId: post.categoryId,
      categoryName: categoryName,
      author: authorName,
      viewCount: post.viewCount,
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
    // Generate presigned download URL - mock implementation
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION;
    return `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600`;
  }
}
