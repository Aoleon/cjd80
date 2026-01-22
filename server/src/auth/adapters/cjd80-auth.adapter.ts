import { IAuthStorageAdapter, IAuthUser } from '@robinswood/auth';
import { db } from '../../../db';
import { admins, passwordResetTokens, ADMIN_STATUS } from '../../../../shared/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';

/**
 * Adapter auth pour cjd80 - Utilise la table 'admins'
 */
export class CJD80AuthAdapter implements IAuthStorageAdapter {
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

  async createPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResetTokens).values({
      email,
      token,
      expiresAt,
    });
  }

  async getPasswordResetToken(token: string): Promise<{ email: string; expiresAt: Date } | null> {
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
      email: resetToken.email,
      expiresAt: resetToken.expiresAt,
    };
  }

  async markTokenAsUsed(token: string): Promise<void> {
    // Type explicite pour contourner problème d'inférence Drizzle avec colonnes nullable
    const updateData: Partial<typeof passwordResetTokens.$inferInsert> = {
      usedAt: new Date(),
    };

    await db
      .update(passwordResetTokens)
      .set(updateData)
      .where(eq(passwordResetTokens.token, token));
  }
}
