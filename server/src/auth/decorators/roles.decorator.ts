import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/auth/entities';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
