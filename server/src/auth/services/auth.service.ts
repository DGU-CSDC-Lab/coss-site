import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
} from '@/auth/dto/auth.dto';
import { Account, User, UserRole, PendingUser } from '@/auth/entities';
import { LoginRequest, LoginResponse } from '@/auth/dto/login.dto';
import { RefreshTokenRequest } from '@/auth/dto/token.dto';
import { UserInfoResponse } from '@/auth/dto/info.dto';
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
          originalError: error
        }
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
  async login(request: LoginRequest): Promise<LoginResponse> {
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
      this.logger.error(`Failed to send verification email: ${email} - ${error.message}`);
      throw AuthException.failedCodeSend(email, error.message);
    }
  }
}
