import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from '@/auth/services/auth.service';
import { RoleGuard } from '@/auth/guards/role.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/entities/user.entity';
import { LoginRequest, LoginResponse } from '@/auth/dto/login.dto';
import { RefreshTokenRequest } from '@/auth/dto/token.dto';
import {
  AdminInfoResponse,
  UpdateUserInfoRequest,
  UserInfoResponse,
} from '@/auth/dto/info.dto';
import {
  RegisterRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  VerifyCodeRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  CreateSubAdminRequest,
  UpdateUserPermissionRequest,
  SetPasswordRequest,
  MigrateAccountRequest,
} from '@/auth/dto/auth.dto';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '회원가입 - 인증 이메일 발송' })
  @ApiResponse({ status: 201, description: '인증 이메일 발송 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() request: RegisterRequest): Promise<void> {
    return this.service.register(request);
  }

  @Post('verify-email')
  @ApiOperation({ summary: '이메일 인증 확인' })
  @HttpCode(HttpStatus.CREATED)
  async verifyEmail(
    @Body() request: VerifyEmailRequest,
  ): Promise<UserInfoResponse> {
    return this.service.verifyEmail(request);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() request: LoginRequest): Promise<LoginResponse> {
    return this.service.login(request);
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() request: RefreshTokenRequest): Promise<LoginResponse> {
    return this.service.refresh(request);
  }

  @Get('user/info')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '내 정보 조회' })
  @HttpCode(HttpStatus.OK)
  async getMe(@Request() auth): Promise<UserInfoResponse> {
    return this.service.getUserInfo(auth.user.id);
  }

  // 내 정보 수정
  @Put('user/info')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '내 정보 수정' })
  @HttpCode(HttpStatus.OK)
  async updateMe(
    @Request() auth,
    @Body() request: UpdateUserInfoRequest,
  ): Promise<UserInfoResponse> {
    return this.service.updateUserInfo(auth.user.id, request);
  }

  // 모든 관리자 유저 조회
  @Get('admin/permissions')
  @UseGuards(RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '모든 유저의 관리자 권한 조회' })
  async getAllUserPermissions(@Request() auth): Promise<AdminInfoResponse[]> {
    return this.service.getUserAdmin(auth.user.id);
  }

  // 서브 관리자 생성
  @Post('sub-admin/create')
  @UseGuards(RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '서브 관리자 생성' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  @HttpCode(HttpStatus.CREATED)
  async createSubAdmin(
    @Request() auth,
    @Body() request: CreateSubAdminRequest,
  ): Promise<UserInfoResponse> {
    return this.service.createSubAdmin(auth.user.id, request);
  }

  // 관리자 권한 변경
  @Put('admin/permissions')
  @UseGuards(RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '사용자 권한 변경' })
  @HttpCode(HttpStatus.OK)
  async updateUserPermission(
    @Request() auth,
    @Body() request: UpdateUserPermissionRequest,
  ): Promise<void> {
    return this.service.updateUserPermission(auth.user.id, request);
  }

  // 관리자 제거
  @Delete('admin/:id/permissions')
  @UseGuards(RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '관리자 제거' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAdmin(@Request() auth, @Param('id') id: string): Promise<void> {
    return this.service.deleteSubAdmin(auth.user.id, id);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: '비밀번호 찾기' })
  @ApiResponse({ status: 200, description: '인증번호 발송 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 이메일' })
  @ApiResponse({ status: 500, description: '인증번호 발송 실패' })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() request: ForgotPasswordRequest): Promise<void> {
    return this.service.forgotPassword(request);
  }

  @Post('verify-code')
  @ApiOperation({ summary: '인증번호 확인' })
  @ApiResponse({ status: 200, description: '인증번호 확인 성공' })
  @ApiResponse({ status: 400, description: '인증번호 불일치 또는 만료' })
  @ApiResponse({ status: 404, description: '인증번호 없음' })
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() request: VerifyCodeRequest): Promise<void> {
    return this.service.verifyCode(request);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiResponse({ status: 200, description: '비밀번호 재설정 성공' })
  @ApiResponse({ status: 400, description: '인증번호 불일치 또는 만료' })
  @ApiResponse({ status: 404, description: '존재하지 않는 이메일' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() request: ResetPasswordRequest): Promise<void> {
    return this.service.resetPassword(request);
  }

  @Post('change-password')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 200, description: '비밀번호 변경 성공' })
  @ApiResponse({
    status: 400,
    description: '현재 비밀번호 불일치 또는 동일한 비밀번호',
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() auth,
    @Body() request: ChangePasswordRequest,
  ): Promise<void> {
    return this.service.changePassword(auth.user.id, request);
  }

  // 비밀번호 설정 (최초 로그인)
  @Post('set-password')
  @ApiOperation({ summary: '비밀번호 설정 (최초 로그인)' })
  @ApiResponse({ status: 200, description: '비밀번호 설정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 토큰' })
  @HttpCode(HttpStatus.OK)
  async setPassword(@Body() request: SetPasswordRequest): Promise<void> {
    return this.service.setPassword(request);
  }

  // 비밀번호 설정 링크 재발급
  @Post('resend-password-link')
  @UseGuards(RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '비밀번호 설정 링크 재발급' })
  @ApiResponse({ status: 200, description: '링크 재발급 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자' })
  @HttpCode(HttpStatus.OK)
  async resendPasswordLink(
    @Request() auth,
    @Body() request: { userId: string },
  ): Promise<void> {
    return this.service.resendPasswordLink(auth.user.id, request.userId);
  }

  // (대표 관리자용) - 계정 이관
  @Post('migrate-account')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMINISTRATOR)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '계정 이관' })
  @ApiResponse({ status: 200, description: '계정 이관 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @HttpCode(HttpStatus.OK)
  async migrateAccount(
    @Request() auth,
    @Body()
    request: MigrateAccountRequest,
  ): Promise<void> {
    return this.service.migrateAccount(auth.user.id, request);
  }
}
