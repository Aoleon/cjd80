import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { logger } from '../../lib/logger';

@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12;

  /**
   * Hash un mot de passe avec bcrypt
   */
  async hashPassword(plainPassword: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
      logger.debug('[PasswordService] Mot de passe hashé avec succès');
      return hash;
    } catch (error) {
      logger.error('[PasswordService] Erreur lors du hashage', { error });
      throw new Error('Erreur lors du hashage du mot de passe');
    }
  }

  /**
   * Vérifie un mot de passe contre son hash
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      logger.debug('[PasswordService] Vérification mot de passe', { isValid });
      return isValid;
    } catch (error) {
      logger.error('[PasswordService] Erreur lors de la vérification', { error });
      return false;
    }
  }

  /**
   * Génère un token sécurisé pour le reset de mot de passe
   */
  generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Valide la force d'un mot de passe
   * Retourne null si valide, sinon un message d'erreur
   */
  validatePasswordStrength(password: string): string | null {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/[a-z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!/[0-9]/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  }
}
