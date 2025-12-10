import { Injectable, BadRequestException } from '@nestjs/common';
import { StorageService } from '../common/storage/storage.service';
import { PasswordService } from './password.service';
import { emailService } from '../../email-service';
import { logger } from '../../lib/logger';
import { db, runDbQuery } from '../../db';
import { passwordResetTokens } from '../../../shared/schema';
import { eq, and, gt, isNull, lt, sql } from 'drizzle-orm';

@Injectable()
export class PasswordResetService {
  constructor(
    private storageService: StorageService,
    private passwordService: PasswordService,
  ) {}

  /**
   * Demande de réinitialisation de mot de passe
   */
  async requestPasswordReset(email: string): Promise<void> {
    logger.info('[PasswordReset] Demande de reset', { email });

    const userResult = await this.storageService.storage.getUser(email);
    if (!userResult.success || !userResult.data) {
      logger.warn('[PasswordReset] Email non trouvé, mais on ne révèle pas', { email });
      return;
    }

    const token = this.passwordService.generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, email));

    await db.insert(passwordResetTokens).values({
      email,
      token,
      expiresAt,
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const user = userResult.data;
    const htmlContent = this.generateResetEmailHtml(user.firstName, resetUrl);

    await emailService.sendEmail({
      to: [email],
      subject: 'Réinitialisation de votre mot de passe - CJD80',
      html: htmlContent,
    });

    logger.info('[PasswordReset] Email de reset envoyé', { email });
  }

  /**
   * Réinitialisation du mot de passe avec le token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    logger.info('[PasswordReset] Tentative de reset avec token');

    const passwordError = this.passwordService.validatePasswordStrength(newPassword);
    if (passwordError) {
      throw new BadRequestException(passwordError);
    }

    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, sql`NOW()`),
          isNull(passwordResetTokens.usedAt)
        )
      );

    if (!tokenRecord) {
      logger.warn('[PasswordReset] Token invalide ou expiré');
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }

    const hashedPassword = await this.passwordService.hashPassword(newPassword);

    await this.storageService.storage.updateAdminPassword(tokenRecord.email, hashedPassword);

    // Marquer le token comme utilisé via SQL brut pour éviter les problèmes de typage
    await db.execute(sql`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${tokenRecord.id}`);

    logger.info('[PasswordReset] Mot de passe réinitialisé avec succès', { email: tokenRecord.email });
  }

  /**
   * Vérifie si un token est valide
   */
  async validateToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, sql`NOW()`),
          isNull(passwordResetTokens.usedAt)
        )
      );

    if (!tokenRecord) {
      return { valid: false };
    }

    return { valid: true, email: tokenRecord.email };
  }

  /**
   * Nettoie les tokens expirés
   */
  async cleanExpiredTokens(): Promise<number> {
    const result = await db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, sql`NOW()`))
      .returning();

    logger.info('[PasswordReset] Tokens expirés nettoyés', { count: result.length });
    return result.length;
  }

  /**
   * Génère le HTML de l'email de reset
   */
  private generateResetEmailHtml(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">CJD80</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e3a8a; margin-top: 0;">Bonjour ${firstName},</h2>
          
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          
          <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Ce lien est valable pendant <strong>1 heure</strong>.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            CJD Amiens - Centre des Jeunes Dirigeants
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
