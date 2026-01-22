import { IAuthStorageAdapter, IAuthUser, IPasswordResetToken } from '@robinswood/auth';
import { db } from '../../../db';
import { admins, passwordResetTokens, ADMIN_STATUS } from '../../../../shared/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';

/**
 * Adapter auth pour cjd80 avec @robinswood/auth-unified
 * Utilise la table 'admins' pour l'authentification
 */
export class CJD80AuthUnifiedAdapter implements IAuthStorageAdapter {
  /**
   * Récupérer un utilisateur par email
   */
  async getUserByEmail(email: string): Promise<IAuthUser | null> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    if (!admin) return null;

    return {
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      password: admin.password,
      role: admin.role,
      isActive: admin.isActive && admin.status === ADMIN_STATUS.ACTIVE,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  /**
   * Mettre à jour le mot de passe d'un utilisateur
   */
  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    // Type explicite pour contourner problème d'inférence Drizzle avec colonnes nullable
    const updateData: Partial<typeof admins.$inferInsert> = {
      password: hashedPassword,
      updatedAt: new Date(),
    };

    await db
      .update(admins)
      .set(updateData)
      .where(eq(admins.email, email));
  }

  /**
   * Créer un token de réinitialisation de mot de passe
   */
  async createPasswordResetToken(
    data: Omit<IPasswordResetToken, 'usedAt'>
  ): Promise<void> {
    await db.insert(passwordResetTokens).values({
      email: data.userEmail,
      token: data.token,
      expiresAt: data.expiresAt,
    });
  }

  /**
   * Récupérer un token de réinitialisation de mot de passe
   */
  async getPasswordResetToken(token: string): Promise<IPasswordResetToken | null> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!resetToken) return null;

    return {
      token: resetToken.token,
      userEmail: resetToken.email,
      expiresAt: resetToken.expiresAt,
      usedAt: resetToken.usedAt,
    };
  }

  /**
   * Marquer un token comme utilisé
   */
  async markResetTokenUsed(token: string): Promise<void> {
    // Type explicite pour contourner problème d'inférence Drizzle avec colonnes nullable
    const updateData: Partial<typeof passwordResetTokens.$inferInsert> = {
      usedAt: new Date(),
    };

    await db
      .update(passwordResetTokens)
      .set(updateData)
      .where(eq(passwordResetTokens.token, token));
  }

  /**
   * Récupérer les permissions d'un utilisateur
   * Pour l'instant, retourne les permissions basées sur le rôle
   * via la configuration rolePermissionsMap dans auth.module.ts
   */
  async getPermissions(email: string): Promise<string[]> {
    const user = await this.getUserByEmail(email);
    if (!user) return [];

    // Les permissions sont gérées via rolePermissionsMap
    // dans la configuration du module pour simplifier
    // Retourner un tableau vide, les permissions seront
    // vérifiées via le customPermissionChecker
    return [];
  }
}
