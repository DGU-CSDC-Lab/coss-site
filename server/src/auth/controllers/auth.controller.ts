import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { AuthService } from '@/auth/services/auth.service';
import { LoginRequest, LoginResponse } from '@/auth/dto/login.dto';
import { RefreshTokenRequest } from '@/auth/dto/token.dto';
import { UserInfoResponse } from '@/auth/dto/info.dto';
import {
  RegisterRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  VerifyCodeRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/auth/dto/auth.dto';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: '회원가입 - 인증 이메일 발송',
    description: '이메일과 비밀번호로 회원가입을 요청하고 인증 이메일을 발송합니다.',
  })
  @ApiBody({ type: RegisterRequest })
  @ApiResponse({
    status: 201,
    description: '인증 이메일 발송 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '인증 이메일이 발송되었습니다. 이메일을 확인해주세요.' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() request: RegisterRequest): Promise<void> {
    return this.service.register(request);
  }

  @Post('verify-email')
  @ApiOperation({
    summary: '이메일 인증 확인',
    description: '인증 코드를 확인하고 회원가입을 완료합니다.',
  })
  @ApiBody({ type: VerifyEmailRequest })
  @ApiResponse({
    status: 201,
    description: '이메일 인증 및 회원가입 완료',
    type: UserInfoResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 인증 코드 또는 만료된 코드' })
  @ApiResponse({ status: 404, description: '인증 요청을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async verifyEmail(@Body() request: VerifyEmailRequest): Promise<UserInfoResponse> {
    return this.service.verifyEmail(request);
  }

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.',
  })
  @ApiBody({ type: LoginRequest })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/LoginResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '존재하지 않는 이메일' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() request: LoginRequest): Promise<LoginResponse> {
    return this.service.login(request);
  }

  @Post('refresh')
  @ApiOperation({
    summary: '토큰 갱신',
    description: 'Refresh 토큰으로 새로운 Access 토큰을 발급받습니다.',
  })
  @ApiBody({ type: RefreshTokenRequest })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/LoginResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() request: RefreshTokenRequest): Promise<LoginResponse> {
    return this.service.refresh(request);
  }

  @Get('user/info')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 로그인한 사용자의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/UserInfoResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getMe(@Request() auth): Promise<UserInfoResponse> {
    return this.service.getUserInfo(auth.user.id);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: '비밀번호 찾기',
    description: '이메일로 인증번호를 발송합니다.',
  })
  @ApiBody({ type: ForgotPasswordRequest })
  @ApiResponse({
    status: 200,
    description: '인증번호 발송 완료',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '존재하지 않는 이메일' })
  @ApiResponse({ status: 500, description: '인증번호 발송 실패' })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() request: ForgotPasswordRequest): Promise<void> {
    return this.service.forgotPassword(request);
  }

  @Post('verify-code')
  @ApiOperation({
    summary: '인증번호 확인',
    description: '이메일로 받은 인증번호를 확인합니다.',
  })
  @ApiBody({ type: VerifyCodeRequest })
  @ApiResponse({
    status: 200,
    description: '인증번호 확인 완료',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: '인증번호 불일치 또는 만료' })
  @ApiResponse({ status: 404, description: '인증번호 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() request: VerifyCodeRequest): Promise<void> {
    return this.service.verifyCode(request);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: '비밀번호 재설정',
    description: '인증번호 확인 후 새로운 비밀번호로 변경합니다.',
  })
  @ApiBody({ type: ResetPasswordRequest })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 완료',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: '인증번호 불일치 또는 만료' })
  @ApiResponse({ status: 404, description: '존재하지 않는 이메일' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() request: ResetPasswordRequest): Promise<void> {
    return this.service.resetPassword(request);
  }

  @Post('change-password')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '비밀번호 변경',
    description: '현재 비밀번호를 확인하고 새로운 비밀번호로 변경합니다.',
  })
  @ApiBody({ type: ChangePasswordRequest })
  @ApiResponse({
    status: 200,
    description: '비밀번호 변경 완료',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: '현재 비밀번호 불일치 또는 동일한 비밀번호',
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() auth,
    @Body() request: ChangePasswordRequest,
  ): Promise<void> {
    return this.service.changePassword(auth.user.id, request);
  }
}
