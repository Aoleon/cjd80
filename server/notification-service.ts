import webpush from 'web-push';
import { db } from './db';
import { eq } from 'drizzle-orm';

// Configuration des clés VAPID - générées pour le développement
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BPKt_8r2V3SJwVJLGnrvbHcwXBHbMhKYPr3rXjMQhUZOQVbgMZC9_X8fK3HSDx9rDKXe7CgVGaYSLnwJVFtUnQM';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'h-rvwG_P4v5J2JQQ7JfnqoPlbPf_8fNEYPLYP8rQh2E';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@cjd-amiens.fr';

// Configuration de web-push seulement si les clés sont valides
try {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  console.log('[Notifications] Configuration VAPID réussie');
} catch (error) {
  console.warn('[Notifications] Erreur configuration VAPID (mode développement):', (error as Error).message);
}

interface PushSubscription {
  id?: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  userId?: string;
  createdAt?: Date;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class NotificationService {
  private subscriptions: Map<string, PushSubscription> = new Map();

  constructor() {
    // Charger les abonnements existants au démarrage
    this.loadSubscriptions();
  }

  private async loadSubscriptions(): Promise<void> {
    try {
      // TODO: Charger depuis la base de données quand la table sera créée
      console.log('[Notifications] Service initialisé');
    } catch (error) {
      console.error('[Notifications] Erreur chargement abonnements:', error);
    }
  }

  // Ajouter un nouvel abonnement
  async addSubscription(subscription: Omit<PushSubscription, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      // Vérifier que l'abonnement est valide
      if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
        throw new Error('Abonnement invalide');
      }

      // Stocker en mémoire pour l'instant
      this.subscriptions.set(subscription.endpoint, {
        ...subscription,
        createdAt: new Date()
      });

      console.log(`[Notifications] Nouvel abonnement ajouté: ${subscription.endpoint.slice(0, 50)}...`);
      return true;
    } catch (error) {
      console.error('[Notifications] Erreur ajout abonnement:', error);
      return false;
    }
  }

  // Supprimer un abonnement
  async removeSubscription(endpoint: string): Promise<boolean> {
    try {
      const removed = this.subscriptions.delete(endpoint);
      console.log(`[Notifications] Abonnement supprimé: ${endpoint.slice(0, 50)}...`);
      return removed;
    } catch (error) {
      console.error('[Notifications] Erreur suppression abonnement:', error);
      return false;
    }
  }

  // Envoyer une notification à tous les abonnés
  async sendToAll(payload: NotificationPayload): Promise<{ sent: number; failed: number }> {
    const results = { sent: 0, failed: 0 };
    const subscriptions = Array.from(this.subscriptions.values());

    console.log(`[Notifications] Envoi à ${subscriptions.length} abonnés: ${payload.title}`);

    // Envoyer en parallèle avec limite de concurrent
    const batchSize = 10;
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      const promises = batch.map(subscription => this.sendToSubscription(subscription, payload));
      
      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          results.sent++;
        } else {
          results.failed++;
        }
      });
    }

    console.log(`[Notifications] Résultats: ${results.sent} envoyées, ${results.failed} échouées`);
    return results;
  }

  // Envoyer une notification à un abonnement spécifique
  private async sendToSubscription(subscription: PushSubscription, payload: NotificationPayload): Promise<boolean> {
    try {
      const pushConfig = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      };

      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192.svg',
        badge: payload.badge || '/icon-192.svg',
        tag: payload.tag || 'default',
        data: payload.data || {},
        actions: payload.actions || []
      });

      await webpush.sendNotification(pushConfig, notificationPayload, {
        TTL: 24 * 60 * 60, // 24 heures
        urgency: 'normal'
      });

      return true;
    } catch (error: any) {
      console.error(`[Notifications] Erreur envoi à ${subscription.endpoint.slice(0, 50)}:`, error.message);
      
      // Supprimer les abonnements invalides (410 Gone, 400 Bad Request)
      if (error.statusCode === 410 || error.statusCode === 400) {
        await this.removeSubscription(subscription.endpoint);
      }
      
      return false;
    }
  }

  // Méthodes spécialisées pour les événements de l'app
  async notifyNewIdea(idea: { title: string; proposedBy: string }): Promise<void> {
    await this.sendToAll({
      title: '💡 Nouvelle idée proposée',
      body: `"${idea.title}" par ${idea.proposedBy}`,
      tag: 'new-idea',
      data: { type: 'new_idea', ideaTitle: idea.title },
      actions: [
        {
          action: 'view',
          title: 'Voir l\'idée'
        },
        {
          action: 'vote',
          title: 'Voter'
        }
      ]
    });
  }

  async notifyNewEvent(event: { title: string; date: string; location: string }): Promise<void> {
    const eventDate = new Date(event.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    await this.sendToAll({
      title: '📅 Nouvel événement',
      body: `${event.title} - ${eventDate} à ${event.location}`,
      tag: 'new-event',
      data: { type: 'new_event', eventTitle: event.title },
      actions: [
        {
          action: 'view',
          title: 'Voir l\'événement'
        },
        {
          action: 'register',
          title: 'S\'inscrire'
        }
      ]
    });
  }

  async notifyIdeaStatusChange(idea: { title: string; status: string; proposedBy: string }): Promise<void> {
    const statusMessages = {
      'approuvée': '✅ Votre idée a été approuvée',
      'rejetée': '❌ Votre idée a été rejetée',
      'en_cours_etude': '🔍 Votre idée est en cours d\'étude',
      'reportée': '⏳ Votre idée a été reportée',
      'réalisée': '🎉 Votre idée a été réalisée'
    };

    const title = statusMessages[idea.status as keyof typeof statusMessages] || 'Statut de votre idée mis à jour';

    await this.sendToAll({
      title,
      body: `"${idea.title}"`,
      tag: 'idea-status-change',
      data: { type: 'idea_status_change', status: idea.status }
    });
  }

  // Obtenir les statistiques
  getStats(): { totalSubscriptions: number; activeSubscriptions: number } {
    return {
      totalSubscriptions: this.subscriptions.size,
      activeSubscriptions: this.subscriptions.size // Tous actifs pour l'instant
    };
  }

  // Obtenir la clé publique VAPID
  getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }
}

// Instance singleton
export const notificationService = new NotificationService();