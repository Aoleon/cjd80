import { Injectable } from '@nestjs/common';
import { CJD80AuthUnifiedAdapter } from './adapters/cjd80-auth-unified.adapter';

/**
 * Wrapper service pour AuthService
 * Utilise l'adapter directement pour compatibilité avec main.ts (Passport serialize/deserialize)
 */
@Injectable()
export class AuthService {
  private adapter = new CJD80AuthUnifiedAdapter();

  /**
   * Serialize user for Passport session
   * Retourne l'email comme identifiant de session
   */
  serializeUser(user: any): string {
    return user.email;
  }

  /**
   * Deserialize user from Passport session
   * Récupère l'utilisateur depuis la DB via son email
   */
  async deserializeUser(email: string): Promise<any> {
    // Utiliser l'adapter pour récupérer l'utilisateur
    const user = await this.adapter.getUserByEmail(email);
    return user;
  }
}
