import {
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class HeaderAssetQuery extends PaginationQuery {
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
    description: '제목',
    example: '메인 헤더',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '이미지 URL',
    example: '/uploads/header.jpg',
  })
  @IsString()
  imageUrl: string;

  @ApiProperty({
    description: '링크 URL',
    example: '/',
  })
  @IsString()
  linkUrl: string;

  @ApiProperty({
    description: '활성 상태',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class HeaderAssetUpdate {
  @ApiProperty({
    description: '제목',
    example: '메인 헤더',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '이미지 URL',
    example: '/uploads/header.jpg',
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
    description: '활성 상태',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class HeaderAssetResponse {
  @ApiProperty({
    description: '헤더 요소 ID',
    example: 'uuid-1234-5678-9012',
  })
  id: string;

  @ApiProperty({
    description: '제목',
    example: '메인 헤더',
  })
  title: string;

  @ApiProperty({
    description: '이미지 URL',
    example: '/uploads/header.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: '링크 URL',
    example: '/',
  })
  linkUrl: string;

  @ApiProperty({
    description: '활성 상태',
    example: true,
  })
  isActive: boolean;

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
