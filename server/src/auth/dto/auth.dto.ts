import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsNumberString,
  Length,
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

/** 비밀번호 재설정 */
// 비밀번호 변경 (로그인 필요)
export class ChangePasswordRequest {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
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