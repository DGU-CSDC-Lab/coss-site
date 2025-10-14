import { IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationQuery } from '@/common/dto/response.dto';

// 팝업 목록 조회 쿼리 DTO
export class PopupQuery extends PaginationQuery {
  @ApiProperty({
    description: '활성 상태 필터',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}

// 팝업 생성 요청 DTO
export class PopupCreate {
  @ApiProperty({
    description: '팝업 제목',
    example: '2024학년도 신입생 모집 안내',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '팝업 내용',
    example: '2024학년도 신입생 모집에 대한 상세 안내입니다.',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '팝업 이미지 URL',
    example: 'https://example.com/popup-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: '링크 URL',
    example: 'https://example.com/admission',
    required: false,
  })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiProperty({
    description: '팝업 시작일',
    example: '2024-03-01T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: '팝업 종료일',
    example: '2024-03-31T23:59:59.000Z',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}

// 팝업 수정 요청 DTO
export class PopupUpdate {
  @ApiProperty({
    description: '팝업 제목',
    example: '2024학년도 신입생 모집 안내',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '팝업 내용',
    example: '2024학년도 신입생 모집에 대한 상세 안내입니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: '팝업 이미지 URL',
    example: 'https://example.com/popup-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: '링크 URL',
    example: 'https://example.com/admission',
    required: false,
  })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiProperty({
    description: '팝업 시작일',
    example: '2024-03-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '팝업 종료일',
    example: '2024-03-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// 팝업 응답 DTO
export class PopupResponse {
  @ApiProperty({
    description: '팝업 ID',
    example: 'uuid-1234-5678-9012',
  })
  id: string;

  @ApiProperty({
    description: '팝업 제목',
    example: '2024학년도 신입생 모집 안내',
  })
  title: string;

  @ApiProperty({
    description: '팝업 내용',
    example: '2024학년도 신입생 모집에 대한 상세 안내입니다.',
  })
  content: string;

  @ApiProperty({
    description: '팝업 이미지 URL',
    example: 'https://example.com/popup-image.jpg',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: '링크 URL',
    example: 'https://example.com/admission',
    required: false,
  })
  linkUrl?: string;

  @ApiProperty({
    description: '팝업 시작일',
    example: '2024-03-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: '팝업 종료일',
    example: '2024-03-31T23:59:59.000Z',
  })
  endDate: Date;
  
  @ApiProperty({
    description: '팝업 생성일',
    example: '2024-02-15T12:34:56.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  isActive: boolean;
}
