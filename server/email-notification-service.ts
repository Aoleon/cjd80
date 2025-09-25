import { emailService } from './email-service';
import { storage } from './storage';
import { createNewIdeaEmailTemplate, createNewEventEmailTemplate, type NotificationContext } from './email-templates';
import type { Idea, Event, Result } from '@shared/schema';

class EmailNotificationService {
  private context: NotificationContext;

  constructor() {
    // Configuration du contexte pour les emails
    this.context = {
      baseUrl: process.env.BASE_URL || 'http://localhost:5000',
      adminDashboardUrl: process.env.BASE_URL ? `${process.env.BASE_URL}/admin` : 'http://localhost:5000/admin'
    };
  }

  // Récupérer tous les emails des administrateurs actifs
  private async getAdminEmails(): Promise<Result<string[]>> {
    try {
      const adminsResult = await storage.getAllAdmins();
      
      if (!adminsResult.success) {
        return adminsResult;
      }

      // Filtrer les admins actifs uniquement
      const activeAdminEmails = adminsResult.data
        .filter(admin => admin.isActive && admin.status === 'active')
        .map(admin => admin.email);

      console.log(`[Email Notifications] ${activeAdminEmails.length} administrateurs actifs trouvés`);

      return {
        success: true,
        data: activeAdminEmails
      };
    } catch (error) {
      console.error('[Email Notifications] Erreur lors de la récupération des admins:', error);
      return {
        success: false,
        error: new Error(`Erreur récupération admins: ${error}`)
      };
    }
  }

  // Notifier les admins d'une nouvelle idée par email
  async notifyNewIdea(idea: Idea): Promise<Result<any>> {
    try {
      console.log(`[Email Notifications] Envoi notification nouvelle idée: ${idea.title}`);

      // Récupérer les emails des administrateurs
      const adminEmailsResult = await this.getAdminEmails();
      if (!adminEmailsResult.success) {
        return adminEmailsResult;
      }

      if (adminEmailsResult.data.length === 0) {
        console.warn('[Email Notifications] Aucun administrateur actif trouvé');
        return {
          success: true,
          data: { message: 'Aucun administrateur à notifier' }
        };
      }

      // Créer le template d'email
      const { subject, html } = createNewIdeaEmailTemplate(
        idea,
        idea.proposedBy,
        this.context
      );

      // Envoyer l'email à tous les administrateurs
      const emailResult = await emailService.sendEmail({
        to: adminEmailsResult.data,
        subject,
        html
      });

      if (emailResult.success) {
        console.log(`[Email Notifications] ✅ Notification idée envoyée à ${adminEmailsResult.data.length} administrateurs`);
      } else {
        console.error('[Email Notifications] ❌ Erreur envoi notification idée:', emailResult.error);
      }

      return emailResult;
    } catch (error) {
      console.error('[Email Notifications] Erreur notification nouvelle idée:', error);
      return {
        success: false,
        error: new Error(`Erreur notification idée: ${error}`)
      };
    }
  }

  // Notifier les admins d'un nouvel événement par email
  async notifyNewEvent(event: Event, organizerName: string): Promise<Result<any>> {
    try {
      console.log(`[Email Notifications] Envoi notification nouvel événement: ${event.title}`);

      // Récupérer les emails des administrateurs
      const adminEmailsResult = await this.getAdminEmails();
      if (!adminEmailsResult.success) {
        return adminEmailsResult;
      }

      if (adminEmailsResult.data.length === 0) {
        console.warn('[Email Notifications] Aucun administrateur actif trouvé');
        return {
          success: true,
          data: { message: 'Aucun administrateur à notifier' }
        };
      }

      // Créer le template d'email
      const { subject, html } = createNewEventEmailTemplate(
        event,
        organizerName,
        this.context
      );

      // Envoyer l'email à tous les administrateurs
      const emailResult = await emailService.sendEmail({
        to: adminEmailsResult.data,
        subject,
        html
      });

      if (emailResult.success) {
        console.log(`[Email Notifications] ✅ Notification événement envoyée à ${adminEmailsResult.data.length} administrateurs`);
      } else {
        console.error('[Email Notifications] ❌ Erreur envoi notification événement:', emailResult.error);
      }

      return emailResult;
    } catch (error) {
      console.error('[Email Notifications] Erreur notification nouvel événement:', error);
      return {
        success: false,
        error: new Error(`Erreur notification événement: ${error}`)
      };
    }
  }

  // Tester la configuration email
  async testEmailConfiguration(): Promise<Result<any>> {
    try {
      console.log('[Email Notifications] Test de configuration email...');

      // Récupérer les emails des administrateurs
      const adminEmailsResult = await this.getAdminEmails();
      if (!adminEmailsResult.success) {
        return adminEmailsResult;
      }

      if (adminEmailsResult.data.length === 0) {
        return {
          success: false,
          error: new Error('Aucun administrateur actif trouvé pour le test')
        };
      }

      // Utiliser le template de test
      const { createTestEmailTemplate } = await import('./email-templates');
      const { subject, html } = createTestEmailTemplate();

      // Envoyer uniquement au premier admin pour le test
      const testEmailResult = await emailService.sendEmail({
        to: [adminEmailsResult.data[0]], // Test sur le premier admin uniquement
        subject,
        html
      });

      if (testEmailResult.success) {
        console.log('[Email Notifications] ✅ Test email envoyé avec succès');
      }

      return testEmailResult;
    } catch (error) {
      console.error('[Email Notifications] Erreur lors du test email:', error);
      return {
        success: false,
        error: new Error(`Erreur test email: ${error}`)
      };
    }
  }

  // Mise à jour du contexte (utile si l'URL de base change)
  updateContext(newContext: Partial<NotificationContext>): void {
    this.context = { ...this.context, ...newContext };
    console.log('[Email Notifications] Contexte mis à jour:', this.context);
  }
}

// Instance singleton
export const emailNotificationService = new EmailNotificationService();