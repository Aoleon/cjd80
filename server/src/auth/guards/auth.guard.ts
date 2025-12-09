import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Guard basé sur la session pour vérifier qu'un utilisateur est authentifié
 * Fonctionne avec Authentik (OAuth2) et l'auth par formulaire classique
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Passport attache `isAuthenticated` quand les sessions sont activées
    const isAuthenticated = typeof request.isAuthenticated === 'function'
      ? request.isAuthenticated()
      : false;

    // Accepte également le cas où Passport a déjà peuplé req.user sans exposer isAuthenticated (tests)
    if (isAuthenticated || request.user) {
      return true;
    }

    throw new UnauthorizedException('Authentication required');
  }
}
