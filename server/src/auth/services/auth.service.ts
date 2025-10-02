import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, User } from '../entities';
import { LoginRequest, LoginResponse, UserMe } from '../dto/login.dto';
import { ForgotPasswordRequest, VerifyCodeRequest, ResetPasswordRequest, ChangePasswordRequest } from '../dto/password-reset.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private resetCodes = new Map<string, { code: string; expiresAt: Date }>();

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const account = await this.accountRepository.findOne({
      where: { email: loginRequest.email },
      relations: ['users'],
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginRequest.password, account.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = account.users[0]; // Assume first user
    if (!user) {
      throw new UnauthorizedException('No user associated with account');
    }

    const payload = { sub: user.id, email: account.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      userId: user.id,
      role: user.role,
    };
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({ 
        where: { id: payload.sub },
        relations: ['account'],
      });
      
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { sub: user.id, email: user.account.email, role: user.role };
      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
        userId: user.id,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string): Promise<UserMe> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['account'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.account.email,
      username: user.username,
      role: user.role,
    };
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }> {
    const account = await this.accountRepository.findOne({ where: { email: request.email } });
    if (!account) {
      throw new NotFoundException('User not found');
    }

    const code = Math.random().toString().slice(2, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    this.resetCodes.set(request.email, { code, expiresAt });

    console.log(`Reset code for ${request.email}: ${code}`);
    return { message: 'Reset code sent to email' };
  }

  async verifyCode(request: VerifyCodeRequest): Promise<{ message: string }> {
    const resetData = this.resetCodes.get(request.email);
    if (!resetData || resetData.code !== request.code || resetData.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset code');
    }
    return { message: 'Reset code verified' };
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    await this.verifyCode({ email: request.email, code: request.code });
    
    const account = await this.accountRepository.findOne({ where: { email: request.email } });
    if (!account) {
      throw new NotFoundException('User not found');
    }

    account.passwordHash = request.newPassword;
    await this.accountRepository.save(account);
    this.resetCodes.delete(request.email);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, request: ChangePasswordRequest): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['account'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.account.passwordHash !== request.currentPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.account.passwordHash = request.newPassword;
    await this.accountRepository.save(user.account);

    return { message: 'Password changed successfully' };
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['account'],
    });
  }
}
