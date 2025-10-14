/** 관리자 인증 권한에 대한 가드 인터페이스 (CanActivate) 구현
 * - JWT 토큰을 검증하고, 사용자가 관리자 권한을 가지고 있는지 확인
 * - 관리자 권한이 없는 경우 접근 거부
 * - 요청 객체에 사용자 정보 추가
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Request } from 'express'; // nestJS는 express Request 타입 사용
import { Logger } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '@/auth/entities';
import { CommonException } from '@/common/exceptions';

@Injectable() // DI 컨테이너에 클래스를 등록하는 역할
export class AdminGuard implements CanActivate {
  // 인터페이스 구현
  private readonly logger = new Logger(AdminGuard.name);

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) // TypeORM 레포지토리는 명시적 주입이 필요함
    private userRepository: Repository<User>,
  ) {
    this.logger.debug('AdminGuard initialized');
  }

  // 실제 요청이 들어올 때마다 실행되는 메서드
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest(); // HTTP 요청 객체 가져오기
    const token = this.extractTokenFromHeader(request); // 헤더에서 토큰 추출

    if (!token) {
      this.logger.warn(
        `Admin access attempt without token from IP: ${request.ip || 'unknown'}`,
      );
      throw CommonException.unauthorized('No token provided');
    }

    try {
      const payload = this.jwtService.verify(token);
      this.logger.debug(
        `Token verification successful for user: ${payload.sub}`,
      );

      // 토큰에서 사용자 정보 추출 후 DB에서 사용자 조회
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        this.logger.warn(
          `Not found user for token: ${payload.sub}`,
        );
        throw CommonException.unauthorized('Invalid token - user not found');
      }

      if (user.role !== UserRole.ADMIN) {
        this.logger.warn(
          `Non-admin access attempt: user ID ${user.id} (role: ${user.role})`,
        );
        throw CommonException.forbidden('Admin access required');
      }

      this.logger.debug(`Admin access granted: user ID ${user.id}`);
      request.user = user;
      return true;
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        this.logger.warn(
          `Admin access attempt with invalid token from IP: ${request.ip || 'unknown'}`,
        );
        throw CommonException.unauthorized('Invalid or expired token');
      }
      
      // CommonException이나 AuthException은 그대로 던지기
      if (error.constructor.name.includes('Exception')) {
        throw error;
      }
      
      this.logger.warn(
        `Admin access attempt with malformed token from IP: ${request.ip || 'unknown'}`,
      );
      throw CommonException.unauthorized('Token verification failed');
    }
  }

  // 요청 헤더에서 Bearer 토큰 추출
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    this.logger.debug(`Header type: ${type}, token: ${token ? '***' : 'none'}`);
    return type === 'Bearer' ? token : undefined;
  }
}
