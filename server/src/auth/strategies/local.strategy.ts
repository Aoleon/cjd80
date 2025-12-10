import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { StorageService } from '../../common/storage/storage.service';
import { PasswordService } from '../password.service';
import { logger } from '../../../lib/logger';
import type { Admin } from '../../../../shared/schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private storageService: StorageService,
    private passwordService: PasswordService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<Admin> {
    logger.info('[LocalStrategy] Tentative de connexion', { email });

    // Récupérer l'utilisateur par email
    const userResult = await this.storageService.storage.getUser(email);
    
    if (!userResult.success || !userResult.data) {
      logger.warn('[LocalStrategy] Utilisateur non trouvé', { email });
      throw new UnauthorizedException('Identifiants invalides');
    }

    const user = userResult.data;

    // Vérifier que l'utilisateur a un mot de passe défini
    if (!user.password) {
      logger.warn('[LocalStrategy] Utilisateur sans mot de passe', { email });
      throw new UnauthorizedException('Mot de passe non configuré. Utilisez la réinitialisation de mot de passe.');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await this.passwordService.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      logger.warn('[LocalStrategy] Mot de passe invalide', { email });
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Vérifier le statut du compte
    if (user.status === 'pending') {
      logger.warn('[LocalStrategy] Compte en attente de validation', { email });
      throw new UnauthorizedException('Votre compte est en attente de validation par un administrateur');
    }

    if (user.status === 'inactive' || !user.isActive) {
      logger.warn('[LocalStrategy] Compte désactivé', { email });
      throw new UnauthorizedException('Votre compte a été désactivé');
    }

    logger.info('[LocalStrategy] Connexion réussie', { email, role: user.role });
    
    return user;
  }
}
