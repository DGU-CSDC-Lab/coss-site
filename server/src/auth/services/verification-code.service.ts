import { AuthException } from '@/common/exceptions';
import { Injectable, Logger } from '@nestjs/common';

export interface VerificationCodeData {
  code: string;
  expiresAt: Date;
  success?: boolean;
}

@Injectable()
export class VerificationCodeService {
  private readonly logger = new Logger(VerificationCodeService.name);
  private verificationCodes = new Map<string, VerificationCodeData>();

  constructor() {
    this.logger.debug('VerificationCodeService initialized');
  }

  // 6자리 숫자 코드 생성
  generateCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.debug('Verification code generated');
    return code;
  }

  // 이메일에 인증코드 저장, 기본 만료시간 10분
  storeCode(email: string, code: string, expirationMinutes: number = 10): void {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    this.verificationCodes.set(email, { code, expiresAt });
    this.logger.log(`Verification code stored for email: ${email}`);
  }

  // 이메일과 코드로 인증
  verifyCode(email: string, inputCode: string): boolean {
    const stored = this.verificationCodes.get(email);

    if (!stored) {
      this.logger.warn(`Verification attempt for non-existent code: ${email}`);
      throw AuthException.notFoundEmail(email);
    }

    if (!stored.code) {
      this.logger.warn(`Verification attempt for empty code: ${email}`);
      throw AuthException.notFoundCode(stored.code);
    }

    if (new Date() > stored.expiresAt) {
      this.verificationCodes.delete(email);
      this.logger.warn(`Expired verification code attempt: ${email}`);
      throw AuthException.expiredCode(inputCode);
    }

    if (stored.code === inputCode) {
      this.verificationCodes.set(email, { ...stored, success: true });
      this.logger.log(`Verification successful: ${email}`);
      return true;
    }

    this.logger.warn(`Invalid verification code attempt: ${email}`);
    throw AuthException.mismatchCode(inputCode);
  }

  // 인증된 코드 사용 처리 (삭제)
  useCode(email: string): boolean{
    const stored = this.verificationCodes.get(email);
    if (!stored) {
      this.logger.warn(`Verification attempt for non-existent code: ${email}`);
      throw AuthException.notFoundEmail(email);
    }

    if (!stored.code) {
      this.logger.warn(`Verification attempt for empty code: ${email}`);
      throw AuthException.notFoundCode(stored.code);
    }

    if (stored && stored.success) {
      this.verificationCodes.delete(email);
      this.logger.log(`Verification code used and deleted for: ${email}`);
      return true;
    }

    this.logger.warn(`Attempt to use unverified code: ${stored.code}`);
    throw AuthException.failedCodeVerify(stored.code, '인증코드 사용에 실패했습니다.');
  }

  // 이메일 인증코드 삭제
  deleteCode(email: string): void {
    const deleted = this.verificationCodes.delete(email);
    if (deleted) {
      this.logger.debug(`Verification code deleted for: ${email}`);
    }
  }

  // 이메일에 인증코드 존재 여부 확인
  hasCode(email: string): boolean {
    return this.verificationCodes.has(email);
  }
}
