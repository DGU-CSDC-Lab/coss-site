import { Injectable, Logger } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

import { AuthException, CommonException } from '@/common/exceptions';
import {
  ForgotPasswordRequest,
  VerifyCodeRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RegisterRequest,
  VerifyEmailRequest,
  CreateSubAdminRequest,
  SetPasswordRequest,
} from '@/auth/dto/auth.dto';
import {
  Account,
  User,
  UserRole,
  PendingUser,
  PasswordResetToken,
} from '@/auth/entities';
import { LoginRequest, LoginResponse } from '@/auth/dto/login.dto';
import { RefreshTokenRequest } from '@/auth/dto/token.dto';
import { UserInfoResponse, UpdateUserInfoRequest, AdminInfoResponse } from '@/auth/dto/info.dto';
import { UpdateUserPermissionRequest } from '@/auth/dto/auth.dto';
import { VerificationCodeService } from '@/auth/services/verification-code.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Nodemailer transporter 설정
  private transporter = this.createTransporter();

  private createTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  // DI를 통한 의존성 주입
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PendingUser)
    private pendingUserRepository: Repository<PendingUser>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    private jwtService: JwtService,
    private verificationCodeService: VerificationCodeService,
  ) {
    this.logger.debug('AuthService initialized');
  }

  // 0.1. 일반(이메일) 회원가입 - 인증 이메일 발송
  async register(request: RegisterRequest): Promise<void> {
    try {
      this.logger.debug(`Register attempt for email: ${request.email}`);

      // 이메일 중복 확인 (기존 사용자)
      const existingAccount = await this.accountRepository.findOne({
        where: { email: request.email },
      });
      if (existingAccount) {
        this.logger.warn(
          `Register failed - email already exists: ${request.email}`,
        );
        throw AuthException.emailAlreadyExists(request.email);
      }

      // 기존 임시 사용자 삭제
      await this.pendingUserRepository.delete({ email: request.email });

      // 인증 코드 생성
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

      // 비밀번호 해시 생성
      const passwordHash = await bcrypt.hash(request.password, 10);

      // 임시 사용자 생성
      const pendingUser = this.pendingUserRepository.create({
        email: request.email,
        passwordHash,
        verificationCode,
        expiresAt,
      });
      await this.pendingUserRepository.save(pendingUser);

      // 인증 이메일 발송
      await this.sendVerificationEmail(request.email, verificationCode);

      this.logger.log(`Verification email sent to: ${request.email}`);
    } catch (error) {
      this.logger.error(
        `Register failed for ${request.email}: ${error.message}`,
        {
          error: error.message,
          stack: error.stack,
          originalError: error,
        },
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 0.2. 이메일 인증 확인 및 회원가입 완료
  async verifyEmail(request: VerifyEmailRequest): Promise<UserInfoResponse> {
    try {
      this.logger.debug(`Email verification attempt for: ${request.email}`);

      // 임시 사용자 조회
      const pendingUser = await this.pendingUserRepository.findOne({
        where: { email: request.email },
      });

      if (!pendingUser) {
        throw AuthException.invalidVerificationCode();
      }

      // 인증 코드 확인
      if (pendingUser.verificationCode !== request.code) {
        throw AuthException.invalidVerificationCode();
      }

      // 만료 시간 확인
      if (new Date() > pendingUser.expiresAt) {
        await this.pendingUserRepository.delete({ email: request.email });
        throw AuthException.verificationCodeExpired();
      }

      // 실제 사용자 생성
      const newUser = this.userRepository.create({
        username: `user-${Math.floor(Math.random() * 10000)}`,
        role: UserRole.USER,
      });
      await this.userRepository.save(newUser);

      // 계정 생성
      const newAccount = this.accountRepository.create({
        email: pendingUser.email,
        passwordHash: pendingUser.passwordHash,
        user: newUser,
      });
      await this.accountRepository.save(newAccount);

      // 임시 사용자 삭제
      await this.pendingUserRepository.delete({ email: request.email });

      this.logger.log(`Email verification successful: ${request.email}`);
      return {
        id: newUser.id,
        email: newAccount.email,
        username: newUser.username,
        role: newUser.role,
      };
    } catch (error) {
      this.logger.error(
        `Email verification failed for ${request.email}: ${error.message}`,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 1.1. 일반(이메일) 로그인
  async login(
    request: LoginRequest,
  ): Promise<LoginResponse & { isFirstLogin: boolean }> {
    try {
      this.logger.debug(`Login attempt for email: ${request.email}`);

      const account = await this.accountRepository.findOne({
        where: { email: request.email },
        relations: ['user'],
      });

      if (!account) {
        this.logger.warn(`Login failed - account not found: ${request.email}`);
        throw AuthException.notFoundEmail(request.email);
      }

      const isPasswordValid = await bcrypt.compare(
        request.password,
        account.passwordHash,
      );
      if (!isPasswordValid) {
        this.logger.warn(`Login failed - invalid password: ${request.email}`);
        throw AuthException.mismatchPassword();
      }

      const user = account.user;
      if (!user) {
        this.logger.error(
          `Login failed - no user associated with account: ${account.id}`,
        );
        throw AuthException.notFoundUser(account.id);
      }

      const payload = { sub: user.id, email: account.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      this.logger.log(
        `Login successful: ${request.email} (role: ${user.role})`,
      );
      return {
        accessToken,
        refreshToken,
        userId: user.id,
        role: user.role,
        isFirstLogin: account.isFirstLogin,
      };
    } catch (error) {
      this.logger.error(`Login error for email: ${request.email}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  // 1.2. 새로운 토큰 갱신
  async refresh(request: RefreshTokenRequest): Promise<LoginResponse> {
    try {
      this.logger.debug('Token refresh attempt');

      // Refresh 토큰이 존재하는지 검증
      const payload = this.jwtService.verify(request.refreshToken);
      // 유저 검색
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['account'],
      });

      if (!user) {
        this.logger.warn(
          `Token refresh failed - user not found: ${payload.sub}`,
        );
        throw AuthException.notFoundUser(payload.sub);
      }

      // 새로운 토큰 발급
      const newPayload = {
        sub: user.id,
        email: user.account.email,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });

      this.logger.log(`Token refresh successful: ${user.account.email}`);
      return {
        accessToken,
        refreshToken: newRefreshToken,
        userId: user.id,
        role: user.role,
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        this.logger.warn('Token refresh failed - token expired');
        throw AuthException.refreshTokenExpired();
      }
      if (error instanceof JsonWebTokenError) {
        throw AuthException.invalidToken();
      }
      this.logger.error('Token refresh error', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  // 2.1. 사용자 정보 조회
  async getUserInfo(userId: string): Promise<UserInfoResponse> {
    try {
      this.logger.debug(`User info request: ${userId}`);

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['account'],
      });
      if (!user) {
        this.logger.warn(
          `User info request failed - user not found: ${userId}`,
        );
        throw AuthException.notFoundUser(userId);
      }

      this.logger.debug(`User info retrieved: ${user.account.email}`);
      return {
        id: user.id,
        email: user.account.email,
        username: user.username,
        role: user.role,
      };
    } catch (error) {
      this.logger.error(`User info error for userId: ${userId}`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  // 2.3. 사용자 정보 수정
  async updateUserInfo(
    userId: string,
    request: UpdateUserInfoRequest,
  ): Promise<UserInfoResponse> {
    try {
      this.logger.debug(`Update user info request: ${userId}`);

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['account'],
      });
      if (!user) {
        this.logger.warn(`Update user info failed - user not found: ${userId}`);
        throw AuthException.notFoundUser(userId);
      }

      user.username = request.username;
      await this.userRepository.save(user);

      this.logger.log(`User info updated: ${user.account.email}`);
      return {
        id: user.id,
        email: user.account.email,
        username: user.username,
        role: user.role,
      };
    } catch (error) {
      this.logger.error(
        `Update user info error for userId: ${userId}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 5.1. 모든 유저의 관리자 권한 조회
  async getUserAdmin(
    userId: string,
  ): Promise<(AdminInfoResponse)[]> {
    try {
      this.logger.debug(`Admin user list request by: ${userId}`);

      const users = await this.userRepository.find({
        where: {
          role: In([
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ADMINISTRATOR,
          ]),
        },
        relations: ['account'],
      });

      const results = [];
      for (const user of users) {
        if (!user.account) continue; // account가 null인 사용자 제외

        let isLinkExpired = false;
        
        // 최초 로그인 사용자인 경우 토큰 만료 여부 확인
        if (user.isFirstLogin) {
          const resetToken = await this.passwordResetTokenRepository.findOne({
            where: {
              userId: user.id,
              type: 'FIRST_LOGIN',
              isUsed: false,
            },
            order: { createdAt: 'DESC' },
          });
          
          if (resetToken) {
            isLinkExpired = new Date() > resetToken.expiresAt;
          } else {
            isLinkExpired = true; // 토큰이 없으면 만료된 것으로 간주
          }
        }

        this.logger.debug(`Admin user found: ${user.role} - ${user.account.email}`);

        results.push({
          id: user.id,
          email: user.account.email,
          username: user.username,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
          createdAt: user.createdAt,
          isLinkExpired,
        });
      }

      this.logger.log(`Admin user list retrieved by: ${userId}`);
      return results;
    } catch (error) {
      this.logger.error(
        `Admin user list error for userId: ${userId}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 5.2. 관리자 권한을 가진 유저 생성
  async createSubAdmin(
    requesterId: string,
    request: CreateSubAdminRequest,
  ): Promise<UserInfoResponse> {
    try {
      this.logger.debug(`Create sub admin attempt for email: ${request.email}`);

      // 요청자 권한 확인
      const requester = await this.userRepository.findOne({
        where: { id: requesterId },
      });
      if (!requester) throw AuthException.notFoundUser(requesterId);

      // 권한 검증
      const targetRole = request.permission as UserRole;
      if (requester.role === UserRole.SUPER_ADMIN) {
        // SUPER_ADMIN은 ADMIN만 생성 가능
        if (targetRole !== UserRole.ADMIN) {
          throw AuthException.insufficientPermissions();
        }
      } else if (requester.role === UserRole.ADMIN) {
        // ADMIN은 아무것도 생성 불가
        throw AuthException.insufficientPermissions();
      }
      // ADMINISTRATOR만 SUPER_ADMIN, ADMIN 둘 다 생성 가능

      // 이메일 중복 확인 (활성 계정만 체크)
      const existingAccount = await this.accountRepository
        .createQueryBuilder('account')
        .leftJoin('account.user', 'user')
        .where('account.email = :email', { email: request.email })
        .andWhere('account.deleted_at IS NULL')
        .andWhere('user.deleted_at IS NULL')
        .getOne();

      if (existingAccount) {
        this.logger.warn(
          `Create sub admin failed - email already exists: ${request.email}`,
        );
        throw AuthException.emailAlreadyExists(request.email);
      }

      this.logger.debug('Creating token payload...');
      // 임시 비밀번호 생성 대신 토큰 생성
      const tokenPayload = {
        userId: '',
        email: request.email,
        type: 'FIRST_LOGIN',
      };

      this.logger.debug('Creating new user...');
      // 사용자 생성 (비밀번호 없이, 최초 로그인 플래그 true)
      const newUser = this.userRepository.create({
        username: request.username,
        role: request.permission as UserRole,
        isFirstLogin: true,
      });
      await this.userRepository.save(newUser);
      this.logger.debug(`User created with ID: ${newUser.id}`);

      // 토큰에 실제 userId 추가
      tokenPayload.userId = newUser.id;
      const token = this.jwtService.sign(tokenPayload, { expiresIn: '24h' });
      this.logger.debug('JWT token generated');

      this.logger.debug('Creating new account...');
      // 계정 생성 (비밀번호 해시 없이)
      const newAccount = this.accountRepository.create({
        email: request.email,
        passwordHash: null, // 비밀번호 설정 전까지 null
      });
      await this.accountRepository.save(newAccount);
      this.logger.debug(`Account created with ID: ${newAccount.id}`);

      // User에 account 연결
      newUser.account = newAccount;
      await this.userRepository.save(newUser);
      this.logger.debug('User-Account relationship established');

      this.logger.debug('Creating password reset token...');
      // 토큰 저장
      const resetToken = this.passwordResetTokenRepository.create({
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간
        type: 'FIRST_LOGIN',
        user: newUser,
        userId: newUser.id,
      });
      await this.passwordResetTokenRepository.save(resetToken);
      this.logger.debug('Password reset token saved');

      // 이메일 발송 (비밀번호 설정 링크)
      const setPasswordUrl = `${process.env.FRONTEND_URL}/auth/set-password?token=${token}`;
      await this.sendAdminPasswordSetupEmail(
        request.email,
        request.username,
        setPasswordUrl,
      );

      this.logger.log(`Sub admin created successfully: ${request.email}`);
      return {
        id: newUser.id,
        email: request.email,
        username: newUser.username,
        role: newUser.role,
      };
    } catch (error) {
      this.logger.error(
        `Create sub admin failed for ${request?.email || 'unknown'}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 5.2.1. 비밀번호 설정 링크 재발급
  async resendPasswordLink(
    requesterId: string,
    targetUserId: string,
  ): Promise<void> {
    try {
      this.logger.debug(`Resend password link attempt for user: ${targetUserId}`);

      // 요청자 권한 확인
      const requester = await this.userRepository.findOne({
        where: { id: requesterId },
      });
      if (!requester) throw AuthException.notFoundUser(requesterId);

      // 대상 사용자 확인
      const targetUser = await this.userRepository.findOne({
        where: { id: targetUserId },
        relations: ['account'],
      });
      if (!targetUser) throw AuthException.notFoundUser(targetUserId);

      // 권한 검증 (자신보다 낮은 권한만 가능)
      if (requester.role === UserRole.SUPER_ADMIN && targetUser.role !== UserRole.ADMIN) {
        throw AuthException.insufficientPermissions();
      } else if (requester.role === UserRole.ADMIN) {
        throw AuthException.insufficientPermissions();
      }

      // 최초 로그인 사용자인지 확인
      if (!targetUser.isFirstLogin) {
        throw new Error('이미 비밀번호가 설정된 사용자입니다.');
      }

      // 기존 토큰 무효화
      await this.passwordResetTokenRepository.update(
        { userId: targetUserId, type: 'FIRST_LOGIN' },
        { isUsed: true }
      );

      // 새 토큰 생성
      const tokenPayload = {
        userId: targetUserId,
        email: targetUser.account.email,
        type: 'FIRST_LOGIN',
      };
      const token = this.jwtService.sign(tokenPayload, { expiresIn: '24h' });

      // 새 토큰 저장
      const resetToken = this.passwordResetTokenRepository.create({
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        type: 'FIRST_LOGIN',
        user: targetUser,
        userId: targetUserId,
      });
      await this.passwordResetTokenRepository.save(resetToken);

      // 이메일 재발송
      const setPasswordUrl = `${process.env.FRONTEND_URL}/auth/set-password?token=${token}`;
      await this.sendAdminPasswordSetupEmail(
        targetUser.account.email,
        targetUser.username,
        setPasswordUrl,
      );

      this.logger.log(`Password link resent successfully for user: ${targetUserId}`);
    } catch (error) {
      this.logger.error(
        `Resend password link failed for user ${targetUserId}: ${error.message}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 5.3. 사용자 권한 변경
  async updateUserPermission(
    requesterId: string,
    request: UpdateUserPermissionRequest,
  ): Promise<void> {
    try {
      this.logger.log(
        `Set user permission request: ${requesterId} -> ${request.userId}`,
      );

      // 자기 자신의 권한을 변경하려는 경우 방지
      if (requesterId === request.userId) {
        this.logger.warn(
          `Set user permission failed - cannot change own permission: ${requesterId}`,
        );
        throw AuthException.cannotUpdateSelf();
      }

      // 요청자 권한 확인
      const requester = await this.userRepository.findOne({
        where: { id: requesterId },
      });
      if (!requester) throw AuthException.notFoundUser(requesterId);

      // 권한 검증
      const targetRole = request.permission as UserRole;
      if (requester.role === UserRole.SUPER_ADMIN) {
        // SUPER_ADMIN은 ADMIN만 설정 가능
        if (targetRole !== UserRole.ADMIN) {
          throw AuthException.insufficientPermissions();
        }
      } else if (requester.role === UserRole.ADMIN) {
        // ADMIN은 아무것도 설정 불가
        throw AuthException.insufficientPermissions();
      }
      // ADMINISTRATOR만 SUPER_ADMIN, ADMIN 둘 다 설정 가능

      const user = await this.userRepository.findOne({
        where: { id: request.userId },
      });
      if (!user) {
        this.logger.warn(
          `Set user permission failed - user not found: ${request.userId}`,
        );
        throw AuthException.notFoundUser(request.userId);
      }

      user.role = request.permission as UserRole;
      await this.userRepository.save(user);

      this.logger.log(
        `User permission updated: ${request.userId} to role ${request.permission}`,
      );
    } catch (error) {
      this.logger.error(
        `Set user permission error for userId: ${requesterId}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 5.4. 하위 관리자 삭제
  async deleteSubAdmin(requesterId: string, targetId: string): Promise<void> {
    try {
      this.logger.log(
        `Delete sub admin request: ${requesterId} -> ${targetId}`,
      );

      // 자기 자신을 삭제하려는 경우 방지
      if (requesterId === targetId) {
        this.logger.warn(
          `Delete sub admin failed - cannot delete self: ${targetId}`,
        );
        throw AuthException.cannotDeleteSelf();
      }

      const requester = await this.userRepository.findOne({
        where: { id: requesterId },
        relations: ['account'],
      });

      if (!requester) throw AuthException.notFoundUser(requesterId);
      this.logger.debug(`Requester role: ${requester.role}`);

      if (!requester) throw AuthException.notFoundUser(requesterId);
      this.logger.debug(`Requester role: ${requester.role}`);

      const target = await this.userRepository.findOne({
        where: { id: targetId },
        relations: ['account'],
      });

      if (!target) throw AuthException.notFoundUser(targetId);
      this.logger.debug(`Target user: ${JSON.stringify(target)}`);

      // 권한 검증
      if (requester.role === UserRole.SUPER_ADMIN) {
        // SUPER_ADMIN은 ADMIN만 삭제 가능
        if (target.role !== UserRole.ADMIN) {
          throw AuthException.insufficientPermissions();
        }
      } else if (requester.role === UserRole.ADMIN) {
        // ADMIN은 아무것도 삭제 불가
        throw AuthException.insufficientPermissions();
      }
      // ADMINISTRATOR만 SUPER_ADMIN, ADMIN 둘 다 삭제 가능

      // 관련 데이터 삭제
      await this.passwordResetTokenRepository.delete({ userId: targetId });

      const accountToDelete = target.account;
      target.account = null;
      await this.userRepository.save(target);
      await this.userRepository.softRemove(target);

      if (accountToDelete) {
        await this.accountRepository.softRemove(accountToDelete);
      }

      this.logger.log(`Sub admin deleted successfully: ${targetId}`);
    } catch (error) {
      this.logger.error(
        `Delete sub admin error for userId: ${targetId}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 3.1. 비밀번호 찾기 - 이메일로 인증번호 발송
  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    try {
      this.logger.log(`Password reset request: ${request.email}`);

      // 계정 존재 여부 확인
      const account = await this.accountRepository.findOne({
        where: { email: request.email },
      });
      this.logger.debug(`Account id: ${account?.id}`);
      // 계정이 존재하지 않으면 예외 처리
      if (!account) {
        this.logger.warn(
          `Password reset failed - account not found: ${request.email}`,
        );
        throw AuthException.notFoundEmail(request.email);
      }

      // 인증번호 생성 및 저장
      const code = this.verificationCodeService.generateCode();
      this.logger.debug(`Generated reset code for ${request.email}: ${code}`);
      this.verificationCodeService.storeCode(request.email, code, 10); // 10분 만료

      // 이메일 발송
      await this.sendVerificationEmail(request.email, code);

      this.logger.log(`Reset code generated and sent for: ${request.email}`);
      this.logger.debug(`Reset code for ${request.email}: ${code}`); // 개발환경에서만 보임
    } catch (error) {
      this.logger.error(
        `Forgot password error for email: ${request.email}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 3.2. 비밀번호 찾기 - 인증번호 확인
  async verifyCode(request: VerifyCodeRequest): Promise<void> {
    try {
      this.logger.debug(`Reset code verification attempt: ${request.email}`);

      const isValid = this.verificationCodeService.verifyCode(
        request.email,
        request.code,
      );
      if (!isValid) {
        this.logger.warn(`Reset code verification failed: ${request.email}`);
        throw AuthException.failedCodeVerify(
          request.code,
          `isValid: ${isValid}`,
        );
      }

      this.logger.log(`Reset code verified successfully: ${request.email}`);
    } catch (error) {
      this.logger.error(
        `Verify code error for email: ${request.email}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 3.3. 비밀번호 찾기 - 비밀번호 재설정
  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    try {
      this.logger.log(`Password reset attempt: ${request.email}`);

      // 계정 조회
      const account = await this.accountRepository.findOne({
        where: { email: request.email },
      });
      if (!account) {
        this.logger.error(
          `Password reset failed - account not found: ${request.email}`,
        );
        throw AuthException.notFoundEmail(request.email);
      }

      // 코드 사용
      const isValid = this.verificationCodeService.useCode(request.email);
      if (!isValid) {
        this.logger.warn(
          `Password reset failed - invalid code: ${request.code}`,
        );
        throw AuthException.failedCodeVerify(
          request.code,
          `isValid: ${isValid}`,
        );
      }

      // 비밀번호 재설정
      account.passwordHash = await bcrypt.hash(request.newPassword, 10);
      await this.accountRepository.save(account);

      this.logger.log(`Password reset completed: ${request.email}`);
    } catch (error) {
      this.logger.error(
        `Reset password error for email: ${request.email}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  // 3.4. 비밀번호 변경 (로그인 상태)
  async changePassword(
    userId: string,
    request: ChangePasswordRequest,
  ): Promise<void> {
    try {
      this.logger.log(`Password change request: user ${userId}`);

      // 사용자 및 계정 조회
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['account'],
      });
      if (!user) {
        this.logger.warn(`Password change failed - user not found: ${userId}`);
        throw AuthException.notFoundUser(userId);
      }

      // 현재 비밀번호 검증
      const isCurrentPasswordValid = await bcrypt.compare(
        request.currentPassword,
        user.account.passwordHash,
      );
      if (!isCurrentPasswordValid) {
        this.logger.warn(
          `Password change failed - incorrect current password: ${user.account.email}`,
        );
        throw AuthException.mismatchPassword();
      }

      // 새로운 비밀번호가 현재 비밀번호와 다른지 확인
      if (request.currentPassword === request.newPassword) {
        this.logger.warn(
          `Password change failed - new password is same as current password: ${user.account.email}`,
        );
        throw AuthException.isSamePassword();
      }

      // 비밀번호 변경
      user.account.passwordHash = await bcrypt.hash(request.newPassword, 10);
      await this.accountRepository.save(user.account);

      this.logger.log(`Password changed successfully: ${user.account.email}`);
    } catch (error) {
      this.logger.error(
        `Change password error for userId: ${userId}`,
        error.stack,
      );
      throw CommonException.internalServerError(error.message);
    }
  }

  /** Utils 영역 */
  // 인증 이메일 발송
  private async sendVerificationEmail(
    email: string,
    code: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL, // 발신자 주소
        to: email,
        subject: '[IoT학과] 비밀번호 재설정 인증번호',
        html: `
          <h2>비밀번호 재설정</h2>
          <p>인증번호: <strong>${code}</strong></p>
          <p>이 인증번호는 10분 후 만료됩니다.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent successfully: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email: ${email} - ${error.message}`,
      );
      throw AuthException.failedCodeSend(email, error.message);
    }
  }

  // 관리자 비밀번호 설정 이메일 발송
  private async sendAdminPasswordSetupEmail(
    email: string,
    username: string,
    setupUrl: string,
  ): Promise<void> {
    try {
      this.logger.debug(`Attempting to send admin setup email to: ${email}`);

      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: '[IoT학과] 관리자 계정 비밀번호 설정',
        html: `
          <h2>관리자 계정이 생성되었습니다</h2>
          <p>안녕하세요, <strong>${username}</strong>님</p>
          <p>IoT학과 관리자 계정이 생성되었습니다.</p>
          <p>아래 링크를 클릭하여 비밀번호를 설정해주세요:</p>
          <p><a href="${setupUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">비밀번호 설정하기</a></p>
          <p>또는 다음 링크를 복사하여 브라우저에 붙여넣으세요:</p>
          <p>${setupUrl}</p>
          <p>이 링크는 24시간 후 만료됩니다.</p>
          <br>
          <p>감사합니다.</p>
          <p>IoT학과 관리팀</p>
        `,
      };

      this.logger.debug(`Mail options: ${JSON.stringify(mailOptions)}`);

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.debug(`Email send result: ${JSON.stringify(result)}`);
      this.logger.log(`Admin password setup email sent successfully: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send admin setup email: ${email} - ${error.message}`,
        error.stack,
      );
      throw AuthException.failedCodeSend(email, error.message);
    }
  }

  // 비밀번호 설정 (최초 로그인)
  async setPassword(request: SetPasswordRequest): Promise<void> {
    try {
      this.logger.debug('Password set attempt');

      // 토큰 검증
      let payload: any;
      try {
        payload = this.jwtService.verify(request.token);
      } catch (error) {
        this.logger.error('Invalid Token in Password Set: ', error.stack);
        throw AuthException.invalidToken();
      }

      // 토큰 DB에서 확인
      const resetToken = await this.passwordResetTokenRepository.findOne({
        where: {
          token: request.token,
          isUsed: false,
          type: 'FIRST_LOGIN',
        },
        relations: ['user', 'user.account'],
      });

      if (!resetToken) {
        this.logger.warn('Token not found or already used');
        throw AuthException.invalidToken();
      }

      // 토큰 만료 확인
      if (new Date() > resetToken.expiresAt) {
        this.logger.warn('Token expired for password set');
        throw AuthException.invalidToken();
      }

      // 사용자 확인
      const user = resetToken.user;
      if (!user || user.id !== payload.userId) {
        this.logger.warn('User mismatch for password set');
        throw AuthException.invalidToken();
      }

      // 비밀번호 해시 생성
      const passwordHash = await bcrypt.hash(request.password, 10);

      // 계정 업데이트 (비밀번호 설정)
      await this.accountRepository.update(
        { id: user.account.id },
        { passwordHash },
      );

      // 사용자 업데이트 (최초 로그인 플래그 해제)
      await this.userRepository.update(
        { id: user.id },
        { isFirstLogin: false },
      );

      // 토큰 사용 처리
      await this.passwordResetTokenRepository.update(
        { id: resetToken.id },
        { isUsed: true },
      );

      this.logger.log(`Password set successfully for user: ${user.id}`);
    } catch (error) {
      this.logger.error('Password set error', error.stack);
      throw error instanceof AuthException
        ? error
        : CommonException.internalServerError(error.message);
    }
  }
}
