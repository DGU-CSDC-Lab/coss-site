import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequest {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'admin@iot.ac.kr'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginResponse {
  @ApiProperty({
    description: '액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: '리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;

  @ApiProperty({
    description: '토큰 만료 시간 (초)',
    example: 3600
  })
  expiresIn: number;

  @ApiProperty({
    description: '사용자 ID',
    example: 'uuid-1234-5678-9012'
  })
  userId: string;

  @ApiProperty({
    description: '사용자 역할',
    example: 'ADMIN'
  })
  role: string;
}

export class RefreshRequest {
  @ApiProperty({
    description: '리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  refreshToken: string;
}

export class UserMe {
  @ApiProperty({
    description: '사용자 ID',
    example: 'uuid-1234-5678-9012'
  })
  id: string;

  @ApiProperty({
    description: '사용자명',
    example: 'admin'
  })
  username: string;

  @ApiProperty({
    description: '사용자 역할',
    example: 'ADMIN'
  })
  role: string;

  @ApiProperty({
    description: '이메일',
    example: 'admin@iot.ac.kr'
  })
  email: string;
}
