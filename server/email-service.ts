import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { Result } from '@shared/schema';
import { DatabaseError } from '@shared/schema';
import { getShortAppName } from '../client/src/config/branding-core';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailData {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Configuration SMTP OVH
      this.config = {
        host: process.env.SMTP_HOST || 'ssl0.ovh.net',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true' || true, // true pour port 465
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      };

      if (!this.config.auth.user || !this.config.auth.pass) {
        console.warn('[Email] Configuration SMTP incomplète - emails désactivés');
        return;
      }

      this.transporter = nodemailer.createTransport(this.config);
      console.log('[Email] Service email initialisé avec OVH SMTP');

      // Vérifier la connexion
      this.verifyConnection();
    } catch (error) {
      console.error('[Email] Erreur lors de l\'initialisation:', error);
    }
  }

  private async verifyConnection(): Promise<void> {
    if (!this.transporter) return;

    try {
      await this.transporter.verify();
      console.log('[Email] ✅ Connexion SMTP OVH vérifiée');
    } catch (error) {
      console.error('[Email] ❌ Erreur de connexion SMTP:', error);
    }
  }

  async sendEmail(emailData: EmailData): Promise<Result<any>> {
    if (!this.transporter || !this.config) {
      return {
        success: false,
        error: new DatabaseError('Service email non configuré')
      };
    }

    try {
      const mailOptions = {
        from: `"${getShortAppName()}" <${this.config.auth.user}>`,
        to: emailData.to.join(', '),
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || this.stripHtml(emailData.html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[Email] ✅ Email envoyé:', info.messageId);

      return {
        success: true,
        data: info
      };
    } catch (error) {
      console.error('[Email] ❌ Erreur envoi email:', error);
      return {
        success: false,
        error: new DatabaseError(`Erreur envoi email: ${error}`)
      };
    }
  }

  // Méthode utilitaire pour extraire le texte du HTML
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/g, '')
      .trim();
  }

  // Test de connectivité
  async testConnection(): Promise<Result<boolean>> {
    if (!this.transporter) {
      return {
        success: false,
        error: new DatabaseError('Transporter non initialisé')
      };
    }

    try {
      await this.transporter.verify();
      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        error: new DatabaseError(`Test connexion échoué: ${error}`)
      };
    }
  }

  // Réinitialiser la configuration (utile pour les changements d'environnement)
  reinitialize(): void {
    this.initializeTransporter();
  }
}

// Instance singleton
export const emailService = new EmailService();