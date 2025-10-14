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
