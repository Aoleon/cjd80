"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const web_push_1 = __importDefault(require("web-push"));
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../shared/schema");
const logger_1 = require("./lib/logger");
// Configuration des clés VAPID - générées pour le développement
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BPKt_8r2V3SJwVJLGnrvbHcwXBHbMhKYPr3rXjMQhUZOQVbgMZC9_X8fK3HSDx9rDKXe7CgVGaYSLnwJVFtUnQM';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'h-rvwG_P4v5J2JQQ7JfnqoPlbPf_8fNEYPLYP8rQh2E';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@cjd-amiens.fr';
// Configuration de web-push seulement si les clés sont valides
try {
    web_push_1.default.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    console.log('[Notifications] Configuration VAPID réussie');
}
catch (error) {
    console.warn('[Notifications] Erreur configuration VAPID (mode développement):', error.message);
}
class NotificationService {
    constructor() {
        this.subscriptions = new Map();
        this.isLoaded = false;
        this.loadingPromise = null;
        // Ne rien charger dans le constructor pour éviter de bloquer le démarrage
        // Les abonnements seront chargés en background au premier accès
    }
    /**
     * Charge les abonnements en background avec timeout court et fallback gracieux
     */
    async loadSubscriptions() {
        // Éviter les chargements multiples simultanés
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        this.loadingPromise = (async () => {
            try {
                logger_1.logger.info('[Notifications] Démarrage du chargement des abonnements...');
                // Utiliser runDbQuery avec profil 'background' (15s timeout, avec retry)
                const subs = await (0, db_1.runDbQuery)(async () => db_1.db.select().from(schema_1.pushSubscriptions), 'background');
                // Remplir le cache en mémoire
                subs.forEach(sub => {
                    this.subscriptions.set(sub.endpoint, {
                        endpoint: sub.endpoint,
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                        userId: sub.userEmail || undefined
                    });
                });
                this.isLoaded = true;
                logger_1.logger.info(`[Notifications] Service initialisé avec ${subs.length} abonnements`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger_1.logger.warn('[Notifications] Impossible de charger les abonnements (fallback: mode dégradé)', {
                    error: errorMessage,
                    message: 'Le service fonctionnera en mode dégradé - les nouveaux abonnements seront ajoutés au fur et à mesure'
                });
                // Mode dégradé: continuer avec un cache vide
                // Les abonnements seront chargés lors du prochain ajout
                this.isLoaded = true;
            }
            finally {
                this.loadingPromise = null;
            }
        })();
        return this.loadingPromise;
    }
    /**
     * S'assure que les abonnements sont chargés avant d'effectuer une opération
     */
    async ensureLoaded() {
        if (!this.isLoaded) {
            await this.loadSubscriptions();
        }
    }
    /**
     * Démarre le chargement des abonnements en arrière-plan (non-bloquant)
     */
    startBackgroundLoad() {
        this.loadSubscriptions().catch(error => {
            logger_1.logger.error('[Notifications] Erreur fatale lors du chargement background', { error });
        });
    }
    // Ajouter un nouvel abonnement
    async addSubscription(subscription) {
        try {
            // Vérifier que l'abonnement est valide
            if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
                throw new Error('Abonnement invalide');
            }
            // Vérifier si l'abonnement existe déjà
            const existing = await db_1.db.select()
                .from(schema_1.pushSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.pushSubscriptions.endpoint, subscription.endpoint))
                .limit(1);
            if (existing.length === 0) {
                // Insérer dans la base de données
                await db_1.db.insert(schema_1.pushSubscriptions).values({
                    endpoint: subscription.endpoint,
                    p256dh: subscription.p256dh,
                    auth: subscription.auth,
                    userEmail: subscription.userId || null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            else {
                // Mettre à jour l'abonnement existant
                await db_1.db.update(schema_1.pushSubscriptions)
                    .set({
                    p256dh: subscription.p256dh,
                    auth: subscription.auth,
                    userEmail: subscription.userId || null,
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.pushSubscriptions.endpoint, subscription.endpoint));
            }
            // Mettre à jour le cache en mémoire
            this.subscriptions.set(subscription.endpoint, {
                ...subscription,
                createdAt: new Date()
            });
            console.log(`[Notifications] Nouvel abonnement ajouté: ${subscription.endpoint.slice(0, 50)}...`);
            return true;
        }
        catch (error) {
            console.error('[Notifications] Erreur ajout abonnement:', error);
            return false;
        }
    }
    // Supprimer un abonnement
    async removeSubscription(endpoint) {
        try {
            // Supprimer de la base de données
            await db_1.db.delete(schema_1.pushSubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.pushSubscriptions.endpoint, endpoint));
            // Supprimer du cache en mémoire
            const removed = this.subscriptions.delete(endpoint);
            console.log(`[Notifications] Abonnement supprimé: ${endpoint.slice(0, 50)}...`);
            return removed;
        }
        catch (error) {
            console.error('[Notifications] Erreur suppression abonnement:', error);
            return false;
        }
    }
    // Envoyer une notification à tous les abonnés
    async sendToAll(payload) {
        // S'assurer que les abonnements sont chargés
        await this.ensureLoaded();
        const results = { sent: 0, failed: 0 };
        const subscriptions = Array.from(this.subscriptions.values());
        logger_1.logger.info(`[Notifications] Envoi à ${subscriptions.length} abonnés: ${payload.title}`);
        // Envoyer en parallèle avec limite de concurrent
        const batchSize = 10;
        for (let i = 0; i < subscriptions.length; i += batchSize) {
            const batch = subscriptions.slice(i, i + batchSize);
            const promises = batch.map(subscription => this.sendToSubscription(subscription, payload));
            const batchResults = await Promise.allSettled(promises);
            batchResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    results.sent++;
                }
                else {
                    results.failed++;
                }
            });
        }
        logger_1.logger.info(`[Notifications] Résultats: ${results.sent} envoyées, ${results.failed} échouées`);
        return results;
    }
    // Envoyer une notification à un abonnement spécifique
    async sendToSubscription(subscription, payload) {
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
            await web_push_1.default.sendNotification(pushConfig, notificationPayload, {
                TTL: 24 * 60 * 60, // 24 heures
                urgency: 'normal'
            });
            return true;
        }
        catch (error) {
            console.error(`[Notifications] Erreur envoi à ${subscription.endpoint.slice(0, 50)}:`, error.message);
            // Supprimer les abonnements invalides (410 Gone, 400 Bad Request)
            if (error.statusCode === 410 || error.statusCode === 400) {
                await this.removeSubscription(subscription.endpoint);
            }
            return false;
        }
    }
    // Méthodes spécialisées pour les événements de l'app
    async notifyNewIdea(idea) {
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
    async notifyNewEvent(event) {
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
    async notifyNewLoanItem(loanItem) {
        await this.sendToAll({
            title: '📦 Nouveau matériel proposé au prêt',
            body: `"${loanItem.title}" prêté par ${loanItem.lenderName}`,
            tag: 'new-loan-item',
            data: { type: 'new_loan_item', loanItemTitle: loanItem.title },
            actions: [
                {
                    action: 'view',
                    title: 'Voir le matériel'
                }
            ]
        });
    }
    async notifyIdeaStatusChange(idea) {
        const statusMessages = {
            'approuvée': '✅ Votre idée a été approuvée',
            'rejetée': '❌ Votre idée a été rejetée',
            'en_cours_etude': '🔍 Votre idée est en cours d\'étude',
            'reportée': '⏳ Votre idée a été reportée',
            'réalisée': '🎉 Votre idée a été réalisée'
        };
        const title = statusMessages[idea.status] || 'Statut de votre idée mis à jour';
        await this.sendToAll({
            title,
            body: `"${idea.title}"`,
            tag: 'idea-status-change',
            data: { type: 'idea_status_change', status: idea.status }
        });
    }
    // Obtenir les statistiques
    getStats() {
        return {
            totalSubscriptions: this.subscriptions.size,
            activeSubscriptions: this.subscriptions.size // Tous actifs pour l'instant
        };
    }
    // Obtenir la clé publique VAPID
    getVapidPublicKey() {
        return VAPID_PUBLIC_KEY;
    }
}
exports.NotificationService = NotificationService;
// Instance singleton
exports.notificationService = new NotificationService();
// Démarrer le chargement en arrière-plan (non-bloquant)
exports.notificationService.startBackgroundLoad();
