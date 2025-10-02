import { Controller, Post, Get, Body,  Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginRequest, LoginResponse, RefreshRequest, UserMe } from '../dto/login.dto';
import { ForgotPasswordRequest, VerifyCodeRequest, ResetPasswordRequest, ChangePasswordRequest } from '../dto/password-reset.dto';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '로그인', description: '이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.' })
  @ApiBody({ type: LoginRequest })
  @ApiResponse({ status: 200, description: '로그인 성공', type: LoginResponse })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(loginRequest);
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신', description: 'Refresh 토큰으로 새로운 Access 토큰을 발급받습니다.' })
  @ApiBody({ type: RefreshRequest })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공', type: LoginResponse })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshRequest: RefreshRequest): Promise<LoginResponse> {
    return this.authService.refresh(refreshRequest.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '내 정보 조회', description: '현재 로그인한 사용자의 정보를 조회합니다.' })
  @ApiResponse({ status: 200, description: '사용자 정보', type: UserMe })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async getMe(@Request() req): Promise<UserMe> {
    return this.authService.getMe(req.user.id);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: '비밀번호 찾기', description: '이메일로 인증번호를 발송합니다.' })
  @ApiBody({ type: ForgotPasswordRequest })
  @ApiResponse({ status: 200, description: '인증번호 발송 완료' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() request: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.authService.forgotPassword(request);
  }

  @Post('verify-code')
  @ApiOperation({ summary: '인증번호 확인', description: '이메일로 받은 인증번호를 확인합니다.' })
  @ApiBody({ type: VerifyCodeRequest })
  @ApiResponse({ status: 200, description: '인증번호 확인 완료' })
  @ApiResponse({ status: 400, description: '유효하지 않은 인증번호' })
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() request: VerifyCodeRequest): Promise<{ message: string }> {
    return this.authService.verifyCode(request);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '비밀번호 재설정', description: '인증번호 확인 후 새로운 비밀번호로 변경합니다.' })
  @ApiBody({ type: ResetPasswordRequest })
  @ApiResponse({ status: 200, description: '비밀번호 재설정 완료' })
  @ApiResponse({ status: 400, description: '유효하지 않은 요청' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() request: ResetPasswordRequest): Promise<{ message: string }> {
    return this.authService.resetPassword(request);
  }

  @Post('change-password')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '비밀번호 변경', description: '현재 비밀번호를 확인하고 새로운 비밀번호로 변경합니다.' })
  @ApiBody({ type: ChangePasswordRequest })
  @ApiResponse({ status: 200, description: '비밀번호 변경 완료' })
  @ApiResponse({ status: 400, description: '현재 비밀번호가 일치하지 않음' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req, @Body() request: ChangePasswordRequest): Promise<{ message: string }> {
    return this.authService.changePassword(req.user.id, request);
  }
}
