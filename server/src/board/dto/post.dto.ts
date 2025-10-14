import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PostStatus } from '@/board/entities/board-post.entity';
import { Category } from '@/category/entities';

export class PostFileDto {
  @ApiProperty({
    description: '파일 키 (S3 업로드 후 받은 fileKey)',
    example: 'uploads/2024/03/15/uuid-1234-5678-9012.pdf',
  })
  @IsString()
  fileKey: string;

  @ApiProperty({
    description: '원본 파일명',
    example: 'document.pdf',
  })
  @IsString()
  originalName: string;

  @ApiProperty({
    description: '파일 크기 (bytes)',
    example: 1024000,
    required: false,
  })
  @IsOptional()
  fileSize?: number;

  @ApiProperty({
    description: 'MIME 타입',
    example: 'application/pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class PostFileResponse {
  @ApiProperty({
    description: '파일 ID',
    example: 'file-uuid-1234',
  })
  id: string;

  @ApiProperty({
    description: '원본 파일명',
    example: 'document.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: '파일 크기 (bytes)',
    example: 1024000,
  })
  fileSize?: number;

  @ApiProperty({
    description: '파일 다운로드 URL',
    example: 'https://s3.amazonaws.com/bucket/uploads/file.pdf?signature=...',
  })
  downloadUrl: string;
}

// 게시글 생성 요청 DTO
export class PostCreateRequest {
  @ApiProperty({
    description: '게시글 제목',
    example: '2024학년도 신입생 모집 안내',
  })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: '게시글 내용 (HTML)',
    example:
      '<p>2024학년도 신입생 모집에 대한 상세 안내입니다.</p><p>지원 기간: 2024년 3월 1일 ~ 3월 31일</p>',
  })
  @IsString()
  contentHtml: string;

  @ApiProperty({
    description: '카테고리 슬러그 (영어)',
    example: 'notices',
  })
  @IsString()
  category: Category['slug'];

  @ApiProperty({
    description: '게시글 상태',
    enum: PostStatus,
    example: PostStatus.PUBLIC,
    default: PostStatus.PUBLIC,
    required: false,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus = PostStatus.PUBLIC;

  @ApiProperty({
    description: '썸네일 이미지 URL',
    example: 'https://example.com/images/thumbnail.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({
    description: '첨부파일 목록 (최대 10개)',
    type: [PostFileDto],
    required: false,
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostFileDto)
  files?: PostFileDto[];
}

// 게시글 수정 요청 DTO
export class PostUpdateRequest {
  @ApiProperty({
    description: '게시글 제목',
    example: '2024학년도 신입생 모집 안내 (수정)',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '게시글 내용 (HTML)',
    example: '<p>수정된 2024학년도 신입생 모집 안내입니다.</p>',
    required: false,
  })
  @IsOptional()
  @IsString()
  contentHtml?: string;

  @ApiProperty({
    description: '카테고리 슬러그 (영어)',
    example: 'notices',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: Category['slug'];

  @ApiProperty({
    description: '게시글 상태 (임시저장은 생성 시에만 가능)',
    enum: [PostStatus.PUBLIC, PostStatus.PRIVATE],
    example: PostStatus.PUBLIC,
    required: false,
  })
  @IsOptional()
  @IsEnum([PostStatus.PUBLIC, PostStatus.PRIVATE])
  status?: PostStatus.PUBLIC | PostStatus.PRIVATE;

  @ApiProperty({
    description: '썸네일 이미지 URL',
    example: 'https://example.com/images/new-thumbnail.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({
    description: '첨부파일 목록 (최대 10개)',
    type: [PostFileDto],
    required: false,
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostFileDto)
  files?: PostFileDto[];
}

// 게시글 목록 조회 쿼리 DTO
export class PostListQuery {
  @ApiProperty({
    description: '카테고리 슬러그로 필터링 (영어)',
    example: 'notices',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: Category['slug'];

  @ApiProperty({
    description: '제목 또는 내용 검색 키워드',
    example: '신입생',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  size?: number = 10;

  @ApiProperty({
    description: '정렬 방식',
    example: 'latest',
    enum: ['latest', 'popular'],
    default: 'latest',
    required: false,
  })
  @IsOptional()
  @IsString()
  sort?: 'latest' | 'popular' = 'latest';
}

// 관리자용 게시글 목록 조회 쿼리 DTO (상태 필터 추가)
export class AdminPostListQuery extends PostListQuery {
  @ApiProperty({
    description: '게시글 상태 필터 (관리자 전용). 생략 시 전체 상태의 게시글 조회',
    enum: PostStatus,
    example: PostStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}

// 게시글 목록 응답 DTO
export class PostResponse {
  @ApiProperty({
    description: '게시글 ID',
    example: 'post-uuid-1234-5678-9012',
  })
  id: string;

  @ApiProperty({
    description: '게시글 제목',
    example: '2024학년도 신입생 모집 안내',
  })
  title: string;

  @ApiProperty({
    description: '카테고리명',
    example: '공지사항',
  })
  categoryName: string;

  @ApiProperty({
    description: '카테고리 슬러그 (영어)',
    example: 'notices',
  })
  categorySlug: string;

  @ApiProperty({
    description: '작성자명',
    example: 'Administrator',
  })
  author: string;

  @ApiProperty({
    description: '조회수',
    example: 125,
  })
  viewCount: number;

  @ApiProperty({
    description: '게시글 상태',
    enum: PostStatus,
    example: PostStatus.PUBLIC,
  })
  status: PostStatus;

  @ApiProperty({
    description: '썸네일 이미지 URL',
    example: 'https://example.com/images/thumbnail.jpg',
    required: false,
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description: '첨부파일 존재 여부',
    example: true,
  })
  hasFiles: boolean;

  @ApiProperty({
    description: '첨부파일 개수',
    example: 3,
  })
  fileCount: number;

  @ApiProperty({
    description: '생성일시',
    example: '2024-03-15T09:00:00.000Z',
  })
  createdAt: Date;
}

export class PostDetailResponse extends PostResponse {
  @ApiProperty({
    description: '게시글 내용 (HTML)',
    example:
      '<p>2024학년도 신입생 모집에 대한 상세 안내입니다.</p><p>지원 기간: 2024년 3월 1일 ~ 3월 31일</p>',
  })
  contentHtml: string;

  @ApiProperty({
    description: '첨부파일 목록',
    type: [PostFileResponse],
  })
  files: PostFileResponse[];

  @ApiProperty({
    description: '이전 게시글 정보',
    example: { id: 'post-uuid-prev', title: '2023학년도 졸업식 안내' },
    required: false,
  })
  prevPost?: { id: string; title: string };

  @ApiProperty({
    description: '다음 게시글 정보',
    example: { id: 'post-uuid-next', title: '2024학년도 입학식 안내' },
    required: false,
  })
  nextPost?: { id: string; title: string };
}