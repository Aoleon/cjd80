import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission, ADMIN_ROLES } from '../../../../shared/schema';

/**
 * Guard pour vérifier les permissions de l'utilisateur
 * Remplace requirePermission de Express
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());
    
    if (!requiredPermission) {
      return true; // Pas de permission requise
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Vérifier la permission
    const hasAccess = hasPermission(user.role as keyof typeof ADMIN_ROLES, requiredPermission);
    
    if (!hasAccess) {
      throw new ForbiddenException(`Permission '${requiredPermission}' required`);
    }

    return true;
  }
}

