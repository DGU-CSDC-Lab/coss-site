import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { FeedbackType, FeedbackStatus } from '../entities/feedback.entity';

export class CreateFeedbackRequest {
  @ApiProperty({ description: '제목', example: '로그인 버그 신고' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: '내용', example: '로그인 시 오류가 발생합니다.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '피드백 유형', enum: FeedbackType })
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @ApiProperty({ description: '이미지 URL 목록', required: false })
  @IsOptional()
  imageUrls?: string[];
}

export class FeedbackResponse {
  @ApiProperty({ description: 'ID' })
  id: string;

  @ApiProperty({ description: '제목' })
  title: string;

  @ApiProperty({ description: '내용' })
  content: string;

  @ApiProperty({ description: '피드백 유형', enum: FeedbackType })
  type: FeedbackType;

  @ApiProperty({ description: '상태', enum: FeedbackStatus })
  status: FeedbackStatus;

  @ApiProperty({ description: '이미지 URL 목록' })
  imageUrls?: string[];

  @ApiProperty({ description: '작성자 이름' })
  username: string;

  @ApiProperty({ description: '작성일' })
  createdAt: Date;
}
