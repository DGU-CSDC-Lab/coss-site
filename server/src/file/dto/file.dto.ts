import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PresignRequest {
  @ApiProperty({
    description: '파일명',
    example: 'document.pdf'
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: '파일 타입 (MIME type)',
    example: 'application/pdf'
  })
  @IsString()
  fileType: string;

  @ApiProperty({
    description: '콘텐츠 타입',
    example: 'application/pdf'
  })
  @IsString()
  contentType: string;

  @ApiProperty({
    description: '소유자 타입',
    example: 'POST',
    required: false
  })
  @IsOptional()
  @IsString()
  ownerType?: string;

  @ApiProperty({
    description: '소유자 ID',
    example: 'uuid-1234-5678-9012',
    required: false
  })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiProperty({
    description: '파일 크기 (bytes)',
    example: 1024000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  fileSize?: number;
}

export class FileCompleteRequest {
  @ApiProperty({
    description: '파일 키',
    example: 'uploads/1234567890-uuid.pdf'
  })
  @IsString()
  fileKey: string;

  @ApiProperty({
    description: '소유자 타입',
    example: 'POST',
    required: false
  })
  @IsOptional()
  @IsString()
  ownerType?: string;

  @ApiProperty({
    description: '소유자 ID',
    example: 'uuid-1234-5678-9012',
    required: false
  })
  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class PresignResponse {
  @ApiProperty({
    description: '파일 업로드용 Presigned URL',
    example: 'https://s3.amazonaws.com/bucket/file.pdf?X-Amz-Algorithm=...'
  })
  uploadUrl: string;

  @ApiProperty({
    description: '업로드 후 파일 접근 URL',
    example: 'https://s3.amazonaws.com/bucket/file.pdf'
  })
  fileUrl: string;

  @ApiProperty({
    description: '파일 키 (S3 객체 키)',
    example: 'uploads/2024/03/15/uuid-1234-5678-9012.pdf'
  })
  fileKey: string;

  @ApiProperty({
    description: 'URL 만료 시간 (초)',
    example: 3600
  })
  expiresIn: number;

  @ApiProperty({
    description: '만료 일시',
    example: '2024-03-15T10:00:00.000Z'
  })
  expiresAt: string;
}
