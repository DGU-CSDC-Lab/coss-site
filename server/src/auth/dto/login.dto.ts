import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// 로그인 요청 DTO
export class LoginRequest {
  @ApiProperty({
    description: '사용자 이메일',
    example: 'admin@iot.ac.kr',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: '1234',
    minLength: 4,
  })
  @IsString()
  @MinLength(4)
  password: string;
}

// 로그인 응답 DTO
export class LoginResponse {
  @ApiProperty({
    description: 'Access Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: '사용자 ID',
    example: 'uuid-1234-5678-9012',
  })
  userId: string;

  @ApiProperty({
    description: '사용자 역할',
    example: 'ADMIN',
  })
  role: string;
}