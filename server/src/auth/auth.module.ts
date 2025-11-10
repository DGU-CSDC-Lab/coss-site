import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { Account, User, PendingUser } from '@/auth/entities';
import { AuthController } from '@/auth/controllers/auth.controller';
import { AuthService } from '@/auth/services/auth.service';
import { VerificationCodeService } from '@/auth/services/verification-code.service';
import { RoleGuard } from '@/auth/guards/role.guard';

const logger = new Logger('AuthModule');
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  logger.error('JWT_SECRET is not defined in environment variables');
  logger.debug(`Available env vars: ${Object.keys(process.env).filter(key => key.includes('JWT')).join(', ')}`);
  logger.debug(`NODE_ENV: ${process.env.NODE_ENV}`);
} else {
  logger.debug(`JWT_SECRET loaded successfully (length: ${jwtSecret.length})`);
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, User, PendingUser]), // DB 엔티티 등록
    PassportModule, // 인증 전략
    JwtModule.register({
      // JWT 설정
      secret: jwtSecret || 'fallback-secret-for-development',
      signOptions: { expiresIn: '1h' }, // 토큰 유효기간 1시간
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, VerificationCodeService, RoleGuard],
  exports: [RoleGuard, JwtModule, TypeOrmModule],
})
export class AuthModule {}
