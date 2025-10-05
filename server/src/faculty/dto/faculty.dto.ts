import { IsString, IsOptional, IsEmail, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class FacultyQuery extends PaginationQuery {
  @ApiProperty({
    description: '교수명 검색',
    example: '김교수',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '학과명 검색',
    example: '지능IoT학과',
    required: false,
  })
  @IsOptional()
  @IsString()
  department?: string;
}

export class FacultyCreate {
  @ApiProperty({
    description: '교수명',
    example: '김교수',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '직책',
    example: '교수',
    required: false,
  })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({
    description: '이메일',
    example: 'professor@iot.ac.kr',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: '전화번호',
    example: '02-1234-5678',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: '연구실',
    example: 'IoT연구실 301호',
    required: false,
  })
  @IsOptional()
  @IsString()
  office?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiProperty({
    description: '소속 학과',
    example: '지능IoT학과',
    required: false,
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({
    description: '연구 분야',
    example: ['IoT', '인공지능', '빅데이터'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  researchAreas?: string[];

  @ApiProperty({
    description: '약력',
    example: '서울대학교 컴퓨터공학과 박사',
    required: false,
  })
  @IsOptional()
  @IsString()
  biography?: string;
}

export class FacultyUpdate {
  @ApiProperty({
    description: '교수명',
    example: '김교수',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '직책',
    example: '교수',
    required: false,
  })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({
    description: '이메일',
    example: 'professor@iot.ac.kr',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: '전화번호',
    example: '02-1234-5678',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: '연구실',
    example: 'IoT연구실 301호',
    required: false,
  })
  @IsOptional()
  @IsString()
  office?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiProperty({
    description: '소속 학과',
    example: '지능IoT학과',
    required: false,
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({
    description: '연구 분야',
    example: ['IoT', '인공지능', '빅데이터'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  researchAreas?: string[];

  @ApiProperty({
    description: '약력',
    example: '서울대학교 컴퓨터공학과 박사',
    required: false,
  })
  @IsOptional()
  @IsString()
  biography?: string;
}

export class FacultyResponse {
  @ApiProperty({
    description: '교수진 ID',
    example: 'uuid-1234-5678-9012',
  })
  id: string;

  @ApiProperty({
    description: '교수명',
    example: '김교수',
  })
  name: string;

  @ApiProperty({
    description: '직책',
    example: '교수',
  })
  jobTitle?: string;

  @ApiProperty({
    description: '이메일',
    example: 'professor@iot.ac.kr',
  })
  email?: string;

  @ApiProperty({
    description: '전화번호',
    example: '02-1234-5678',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: '연구실',
    example: 'IoT연구실 301호',
  })
  office?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
  })
  profileImageUrl?: string;

  @ApiProperty({
    description: '소속 학과',
    example: '지능IoT학과',
  })
  department?: string;

  @ApiProperty({
    description: '연구 분야',
    example: ['IoT', '인공지능', '빅데이터'],
  })
  researchAreas?: string[];

  @ApiProperty({
    description: '약력',
    example: '서울대학교 컴퓨터공학과 박사',
  })
  biography?: string;

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
