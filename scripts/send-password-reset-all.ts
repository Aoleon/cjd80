/**
 * Script de migration : Envoi d'emails de réinitialisation à tous les admins
 * 
 * Usage:
 *   cd /opt/workspace/cjd80
 *   npx tsx scripts/send-password-reset-all.ts
 */

import { db } from '../server/db';
import { admins, passwordResetTokens } from '../shared/schema';
import { eq, and, isNull, or } from 'drizzle-orm';
import { emailService } from '../server/email-service';
import * as crypto from 'crypto';

const BASE_URL = process.env.BASE_URL || 'https://cjd80.robinswood.io';

async function generateSecureToken(): Promise<string> {
  return crypto.randomBytes(32).toString('hex');
}

function generateResetEmailHtml(firstName: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Configuration de votre mot de passe</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">CJD80 - Boîte à Kiffs</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1e3a8a; margin-top: 0;">Bonjour ${firstName},</h2>
        
        <p>Suite à la mise à jour de notre système d'authentification, vous devez définir un nouveau mot de passe pour accéder à l'espace d'administration.</p>
        
        <p>Cliquez sur le bouton ci-dessous pour configurer votre mot de passe :</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Configurer mon mot de passe
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Ce lien est valable pendant <strong>24 heures</strong>. Passé ce délai, vous devrez demander un nouveau lien via la page de connexion.
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          <strong>Exigences du mot de passe :</strong><br>
          • Minimum 8 caractères<br>
          • Au moins une majuscule<br>
          • Au moins une minuscule<br>
          • Au moins un chiffre
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          CJD Amiens - Centre des Jeunes Dirigeants<br>
          Si vous n'êtes pas à l'origine de cette demande, veuillez contacter l'administrateur.
        </p>
      </div>
    </body>
    </html>
  `;
}

async function main() {
  console.log('=== Script de migration des mots de passe ===\n');
  
  // Récupérer tous les admins actifs
  const adminsList = await db
    .select()
    .from(admins)
    .where(
      and(
        eq(admins.status, 'active'),
        eq(admins.isActive, true)
      )
    );
  
  console.log(`${adminsList.length} administrateur(s) actif(s) trouvé(s)\n`);
  
  if (adminsList.length === 0) {
    console.log('Aucun administrateur à migrer.');
    return;
  }
  
  let success = 0;
  let errors = 0;
  
  for (const admin of adminsList) {
    try {
      console.log(`Traitement de ${admin.email}...`);
      
      // Générer un token avec une expiration de 24h pour la migration
      const token = await generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
      
      // Supprimer les anciens tokens
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, admin.email));
      
      // Créer le nouveau token
      await db.insert(passwordResetTokens).values({
        email: admin.email,
        token,
        expiresAt,
      });
      
      // Envoyer l'email
      const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
      const htmlContent = generateResetEmailHtml(admin.firstName, resetUrl);
      
      const result = await emailService.sendEmail({
        to: [admin.email],
        subject: 'Configuration de votre mot de passe - CJD80',
        html: htmlContent,
      });
      
      if (result.success) {
        console.log(`  ✓ Email envoyé à ${admin.email}`);
        success++;
      } else {
        console.error(`  ✗ Erreur envoi email ${admin.email}:`, result.error);
        errors++;
      }
    } catch (error) {
      console.error(`  ✗ Erreur pour ${admin.email}:`, error);
      errors++;
    }
  }
  
  console.log('\n=== Résumé ===');
  console.log(`Succès: ${success}`);
  console.log(`Erreurs: ${errors}`);
  console.log(`Total: ${adminsList.length}`);
}

main()
  .then(() => {
    console.log('\nScript terminé.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nErreur fatale:', error);
    process.exit(1);
  });
