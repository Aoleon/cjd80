import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { StorageService } from '../../common/storage/storage.service';
import { logger } from '../../../lib/logger';
import type { Admin } from '../../../../shared/schema';

/**
 * Dev Login Strategy - Bypasses password check for development
 *
 * SECURITY: Only enabled in development (NODE_ENV !== 'production')
 * Allows login with any password for testing purposes
 *
 * Test credentials:
 * - admin@test.local (super_admin)
 * - manager@test.local (events_manager)
 * - reader@test.local (events_reader)
 */
@Injectable()
export class DevLoginStrategy extends PassportStrategy(Strategy, 'dev-login') {
  private readonly isDevMode: boolean;

  constructor(private storageService: StorageService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });

    // Vérifier l'environnement au démarrage
    this.isDevMode = process.env.NODE_ENV !== 'production';

    if (this.isDevMode) {
      logger.warn('[DevLoginStrategy] ⚠️  DEV LOGIN ENABLED - Password checks bypassed');
      logger.warn('[DevLoginStrategy] Test accounts: admin@test.local, manager@test.local, reader@test.local');
    }
  }

  async validate(email: string, password: string): Promise<Admin> {
    // CRITICAL: Reject in production
    if (!this.isDevMode) {
      logger.error('[DevLoginStrategy] ❌ Dev login attempted in production!', { email });
      throw new UnauthorizedException('Dev login not available in production');
    }

    logger.info('[DevLoginStrategy] Dev login attempt', { email });

    // Récupérer l'utilisateur par email
    const userResult = await this.storageService.storage.getUser(email);

    if (!userResult.success || !userResult.data) {
      logger.warn('[DevLoginStrategy] User not found', { email });
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const user = userResult.data;

    // Vérifier le statut du compte
    if (user.status === 'pending') {
      logger.warn('[DevLoginStrategy] Account pending validation', { email });
      throw new UnauthorizedException('Compte en attente de validation');
    }

    if (user.status === 'inactive' || !user.isActive) {
      logger.warn('[DevLoginStrategy] Account inactive', { email });
      throw new UnauthorizedException('Compte désactivé');
    }

    logger.info('[DevLoginStrategy] ✅ Dev login successful (password bypassed)', {
      email,
      role: user.role
    });

    return user;
  }
}
