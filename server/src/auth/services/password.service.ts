import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class PasswordService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private verificationCodes = new Map<
    string,
    { code: string; expiresAt: Date }
  >();

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  storeVerificationCode(email: string, code: string): void {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10분 후 만료
    this.verificationCodes.set(email, { code, expiresAt });
  }

  verifyCode(email: string, code: string): boolean {
    const stored = this.verificationCodes.get(email);
    if (!stored) return false;

    if (new Date() > stored.expiresAt) {
      this.verificationCodes.delete(email);
      return false;
    }

    if (stored.code === code) {
      this.verificationCodes.delete(email);
      return true;
    }

    return false;
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@iot.ac.kr',
      to: email,
      subject: '[IoT학과] 비밀번호 재설정 인증번호',
      html: `
        <h2>비밀번호 재설정</h2>
        <p>인증번호: <strong>${code}</strong></p>
        <p>이 인증번호는 10분 후 만료됩니다.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
