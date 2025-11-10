import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '@/auth/entities';
import { CommonException } from '@/common/exceptions';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(RoleGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw CommonException.unauthorized('No token provided');
    }

    console.log("Started:::");
    const payload = this.jwtService.verify(token);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !requiredRoles.includes(user.role)) {
      throw CommonException.forbidden(`권한이 부족합니다. 당신의 현재 역할: ${user ? user.role : '없음'}`);
    }
    this.logger.log(`RoleGuard: User ${user.id} with role ${user.role} authorized`);
    request.user = user;
    return true;
  }

  private extractTokenFromHeader(request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
