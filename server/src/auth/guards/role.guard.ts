import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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
      throw CommonException.forbidden('Insufficient permissions');
    }
    console.log('RoleGuard: User role validated', user.role);
    request.user = user;
    console.log('RoleGuard: User attached to request', request.user);
    return true;
  }

  private extractTokenFromHeader(request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
