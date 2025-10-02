import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { HeaderAssetType } from '../entities';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class HeaderAssetQuery extends PaginationQuery {
  @ApiProperty({
    description: '헤더 요소 타입',
    enum: HeaderAssetType,
    required: false,
  })
  @IsOptional()
  @IsEnum(HeaderAssetType)
  type?: HeaderAssetType;

  @ApiProperty({
    description: '활성 상태 필터',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;
}

export class HeaderAssetCreate {
  @ApiProperty({
    description: '헤더 요소 타입',
    enum: HeaderAssetType,
    example: HeaderAssetType.BANNER,
  })
  @IsEnum(HeaderAssetType)
  type: HeaderAssetType;

  @ApiProperty({
    description: '제목',
    example: '메인 로고',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '이미지 URL',
    example: '/uploads/logo.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: '링크 URL',
    example: '/',
    required: false,
  })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiProperty({
    description: '텍스트 내용',
    example: '중요 공지사항입니다',
    required: false,
  })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({
    description: '활성 상태',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    description: '표시 순서',
    example: 1,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;

  @ApiProperty({
    description: '시작일시',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '종료일시',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class HeaderAssetUpdate {
  @ApiProperty({
    description: '제목',
    example: '메인 로고',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '이미지 URL',
    example: '/uploads/logo.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: '링크 URL',
    example: '/',
    required: false,
  })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiProperty({
    description: '텍스트 내용',
    example: '중요 공지사항입니다',
    required: false,
  })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({
    description: '활성 상태',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: '표시 순서',
    example: 1,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({
    description: '시작일시',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '종료일시',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class HeaderAssetResponse {
  @ApiProperty({
    description: '헤더 요소 ID',
    example: 'uuid-1234-5678-9012',
  })
  id: string;

  @ApiProperty({
    description: '헤더 요소 타입',
    enum: HeaderAssetType,
  })
  type: HeaderAssetType;

  @ApiProperty({
    description: '제목',
    example: '메인 로고',
  })
  title: string;

  @ApiProperty({
    description: '이미지 URL',
    example: '/uploads/logo.png',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: '링크 URL',
    example: '/',
    required: false,
  })
  linkUrl?: string;

  @ApiProperty({
    description: '텍스트 내용',
    example: '중요 공지사항입니다',
    required: false,
  })
  textContent?: string;

  @ApiProperty({
    description: '활성 상태',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '표시 순서',
    example: 1,
  })
  displayOrder: number;

  @ApiProperty({
    description: '시작일시',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  startDate?: Date;

  @ApiProperty({
    description: '종료일시',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  endDate?: Date;

  @ApiProperty({
    description: '생성일시',
    example: '2024-03-15T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-03-15T09:00:00.000Z',
  })
  updatedAt: Date;
}
