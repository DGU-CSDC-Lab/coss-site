import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsNumberString,
  Length,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

// 이메일 회원가입 DTO
export class RegisterRequest {
  @ApiProperty({
    description: '이메일',
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

// 이메일 인증 확인 DTO
export class VerifyEmailRequest {
  @ApiProperty({
    description: '이메일',
    example: 'admin@iot.ac.kr',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '인증 코드',
    example: '123456',
  })
  @IsNumberString()
  @Length(6, 6)
  code: string;
}

// 비밀번호 재설정 요청 DTO
export class ForgotPasswordRequest {
  @IsEmail()
  email: string;
}

// 인증 코드 검증 DTO
export class VerifyCodeRequest {
  @ApiProperty({
    description: '이메일',
    example: 'admin@iot.ac.kr',
  })
  @IsEmail()
  email: string;

  @IsNumberString()
  @Length(6, 6)
  code: string;
}

// 비밀번호 찾기 (로그인 불필요)
export class ResetPasswordRequest {
  @ApiProperty({
    description: '이메일',
    example: 'admin@iot.ac.kr',
  })
  @IsEmail()
  email: string;

  @IsNumberString()
  @Length(6, 6)
  code: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

// 비밀번호 변경 DTO
export class ChangePasswordRequest {
  @ApiProperty({
    description: '현재 비밀번호',
    example: 'currentPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: '새 비밀번호',
    example: 'newPassword123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  newPassword: string;
}

// 관리자 생성 DTO
export class CreateSubAdminRequest {
  @ApiProperty({
    description: '관리자 이메일',
    example: 'admin@iot.ac.kr',
  })
  @IsEmail()
  email: string;
  
  @ApiProperty({
    description: '관리자명',
    example: 'sub_admin',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: '권한',
    example: 'ADMIN',
  })
  @IsString()
  permission: string; 
}

// 사용자 권한 수정 DTO
export class UpdateUserPermissionRequest {
  @ApiProperty({
    description: '사용자 ID',
    example: 'uuid-1234-5678-9012',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: '새로운 사용자 역할',
    example: 'ADMIN',
  })
  @IsString()
  permission: string;
} 

export class SetPasswordRequest {
  @ApiProperty({
    description: '비밀번호 설정 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: '새 비밀번호',
    example: 'newPassword123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}