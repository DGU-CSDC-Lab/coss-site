import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Account, User, PendingUser, PasswordResetToken } from '@/auth/entities';
import { AuthController } from '@/auth/controllers/auth.controller';
import { AuthService } from '@/auth/services/auth.service';
import { VerificationCodeService } from '@/auth/services/verification-code.service';
import { RoleGuard } from '@/auth/guards/role.guard';

@Module({
  imports: [
    // ConfigModule: env 주입용
    ConfigModule,

    // DB 엔티티 등록
    TypeOrmModule.forFeature([Account, User, PendingUser, PasswordResetToken]),

    // Passport 인증 전략 모듈
    PassportModule,

    // JWT 설정 (ConfigService 통해 안전하게 주입)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const logger = new Logger('AuthModule');

        if (secret === undefined || secret === null) {
          logger.error('JWT_SECRET is not defined in environment variables');
          logger.debug(
            `Available env vars: ${Object.keys(process.env)
              .filter(key => key.includes('JWT'))
              .join(', ')}`,
          );
          logger.debug(`NODE_ENV: ${process.env.NODE_ENV}`);
        } else {
          logger.debug(
            `JWT_SECRET loaded successfully (length: ${secret.length})`,
          );
        }

        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, VerificationCodeService, RoleGuard],
  exports: [RoleGuard, JwtModule, TypeOrmModule],
})
export class AuthModule {}