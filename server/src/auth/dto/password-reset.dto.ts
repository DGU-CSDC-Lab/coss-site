import { IsEmail, IsString, MinLength, IsNumberString, Length } from 'class-validator';

export class ForgotPasswordRequest {
  @IsEmail()
  email: string;
}

export class VerifyCodeRequest {
  @IsEmail()
  email: string;

  @IsNumberString()
  @Length(6, 6)
  code: string;
}

export class ResetPasswordRequest {
  @IsEmail()
  email: string;

  @IsNumberString()
  @Length(6, 6)
  code: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ChangePasswordRequest {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
