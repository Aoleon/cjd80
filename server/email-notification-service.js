"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailNotificationService = void 0;
const email_service_1 = require("./email-service");
const storage_1 = require("./storage");
const email_templates_1 = require("./email-templates");
const schema_1 = require("../shared/schema");
class EmailNotificationService {
    constructor() {
        // Configuration du contexte pour les emails
        this.context = {
            baseUrl: process.env.BASE_URL || 'http://localhost:5000',
            adminDashboardUrl: process.env.BASE_URL ? `${process.env.BASE_URL}/admin` : 'http://localhost:5000/admin'
        };
    }
    // Récupérer tous les emails des administrateurs actifs
    async getAdminEmails() {
        try {
            const adminsResult = await storage_1.storage.getAllAdmins();
            if (!adminsResult.success) {
                return {
                    success: false,
                    error: 'error' in adminsResult ? adminsResult.error : new Error('Unknown error')
                };
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
        }
        catch (error) {
            console.error('[Email Notifications] Erreur lors de la récupération des admins:', error);
            return {
                success: false,
                error: new Error(`Erreur récupération admins: ${error}`)
            };
        }
    }
    // Notifier les admins d'une nouvelle idée par email
    async notifyNewIdea(idea) {
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
            const { subject, html } = (0, email_templates_1.createNewIdeaEmailTemplate)(idea, idea.proposedBy, this.context);
            // Envoyer l'email à tous les administrateurs
            const emailResult = await email_service_1.emailService.sendEmail({
                to: adminEmailsResult.data,
                subject,
                html
            });
            if (emailResult.success) {
                console.log(`[Email Notifications] ✅ Notification idée envoyée à ${adminEmailsResult.data.length} administrateurs`);
            }
            else {
                const error = 'error' in emailResult ? emailResult.error : new Error('Unknown error');
                console.error('[Email Notifications] ❌ Erreur envoi notification idée:', error);
            }
            return emailResult;
        }
        catch (error) {
            console.error('[Email Notifications] Erreur notification nouvelle idée:', error);
            return {
                success: false,
                error: new Error(`Erreur notification idée: ${error}`)
            };
        }
    }
    // Notifier les admins d'un nouvel événement par email
    async notifyNewEvent(event, organizerName) {
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
            const { subject, html } = (0, email_templates_1.createNewEventEmailTemplate)(event, organizerName, this.context);
            // Envoyer l'email à tous les administrateurs
            const emailResult = await email_service_1.emailService.sendEmail({
                to: adminEmailsResult.data,
                subject,
                html
            });
            if (emailResult.success) {
                console.log(`[Email Notifications] ✅ Notification événement envoyée à ${adminEmailsResult.data.length} administrateurs`);
            }
            else {
                const error = 'error' in emailResult ? emailResult.error : new Error('Unknown error');
                console.error('[Email Notifications] ❌ Erreur envoi notification événement:', error);
            }
            return emailResult;
        }
        catch (error) {
            console.error('[Email Notifications] Erreur notification nouvel événement:', error);
            return {
                success: false,
                error: new Error(`Erreur notification événement: ${error}`)
            };
        }
    }
    // Récupérer l'email du responsable recrutement
    async getRecruitmentManagerEmail() {
        try {
            // Utiliser la méthode dédiée pour récupérer le responsable recrutement
            const memberResult = await storage_1.storage.getMemberByCjdRole(schema_1.CJD_ROLES.RESPONSABLE_RECRUTEMENT);
            if (!memberResult.success) {
                return {
                    success: false,
                    error: 'error' in memberResult ? memberResult.error : new Error('Unknown error')
                };
            }
            const recruitmentManager = memberResult.data;
            console.log('[Email Notifications] Responsable recrutement:', recruitmentManager ? recruitmentManager.email : 'Non défini');
            return {
                success: true,
                data: recruitmentManager?.email || null
            };
        }
        catch (error) {
            console.error('[Email Notifications] Erreur lors de la récupération du responsable recrutement:', error);
            return {
                success: false,
                error: new Error(`Erreur récupération responsable recrutement: ${error}`)
            };
        }
    }
    // Notifier le responsable recrutement d'un nouveau membre proposé
    async notifyNewMemberProposal(memberData) {
        try {
            console.log(`[Email Notifications] Envoi notification nouveau membre: ${memberData.firstName} ${memberData.lastName}`);
            // Récupérer l'email du responsable recrutement
            const recruitmentManagerEmailResult = await this.getRecruitmentManagerEmail();
            if (!recruitmentManagerEmailResult.success) {
                return recruitmentManagerEmailResult;
            }
            // Si aucun responsable recrutement défini, envoyer aux admins
            let recipients;
            if (recruitmentManagerEmailResult.data) {
                recipients = [recruitmentManagerEmailResult.data];
                console.log(`[Email Notifications] Envoi au responsable recrutement: ${recruitmentManagerEmailResult.data}`);
            }
            else {
                const adminEmailsResult = await this.getAdminEmails();
                if (!adminEmailsResult.success) {
                    return adminEmailsResult;
                }
                recipients = adminEmailsResult.data;
                console.log(`[Email Notifications] Aucun responsable recrutement défini, envoi aux admins (${recipients.length})`);
            }
            if (recipients.length === 0) {
                console.error('[Email Notifications] ❌ Configuration erreur: Aucun destinataire trouvé pour la proposition de membre');
                return {
                    success: false,
                    error: new Error('Aucun destinataire configuré pour les notifications de proposition de membre. Veuillez assigner un responsable recrutement ou activer des administrateurs.')
                };
            }
            // Créer le template d'email
            const { subject, html } = (0, email_templates_1.createNewMemberProposalEmailTemplate)(memberData, this.context);
            // Envoyer l'email
            const emailResult = await email_service_1.emailService.sendEmail({
                to: recipients,
                subject,
                html
            });
            if (emailResult.success) {
                console.log(`[Email Notifications] ✅ Notification proposition membre envoyée à ${recipients.length} destinataire(s)`);
            }
            else {
                const error = 'error' in emailResult ? emailResult.error : new Error('Unknown error');
                console.error('[Email Notifications] ❌ Erreur envoi notification proposition membre:', error);
            }
            return emailResult;
        }
        catch (error) {
            console.error('[Email Notifications] Erreur notification nouvelle proposition membre:', error);
            return {
                success: false,
                error: new Error(`Erreur notification proposition membre: ${error}`)
            };
        }
    }
    // Tester la configuration email
    async testEmailConfiguration() {
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
            const { createTestEmailTemplate } = await Promise.resolve().then(() => __importStar(require('./email-templates')));
            const { subject, html } = createTestEmailTemplate();
            // Envoyer uniquement au premier admin pour le test
            const testEmailResult = await email_service_1.emailService.sendEmail({
                to: [adminEmailsResult.data[0]], // Test sur le premier admin uniquement
                subject,
                html
            });
            if (testEmailResult.success) {
                console.log('[Email Notifications] ✅ Test email envoyé avec succès');
            }
            return testEmailResult;
        }
        catch (error) {
            console.error('[Email Notifications] Erreur lors du test email:', error);
            return {
                success: false,
                error: new Error(`Erreur test email: ${error}`)
            };
        }
    }
    // Notifier les admins d'un nouveau matériel proposé au prêt
    async notifyNewLoanItem(loanItem) {
        try {
            console.log(`[Email Notifications] Envoi notification nouveau matériel: ${loanItem.title}`);
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
            const { subject, html } = (0, email_templates_1.createNewLoanItemEmailTemplate)(loanItem, this.context);
            // Envoyer l'email à tous les administrateurs
            const emailResult = await email_service_1.emailService.sendEmail({
                to: adminEmailsResult.data,
                subject,
                html
            });
            if (emailResult.success) {
                console.log(`[Email Notifications] ✅ Notification matériel envoyée à ${adminEmailsResult.data.length} administrateurs`);
            }
            else {
                const error = 'error' in emailResult ? emailResult.error : new Error('Unknown error');
                console.error('[Email Notifications] ❌ Erreur envoi notification matériel:', error);
            }
            return emailResult;
        }
        catch (error) {
            console.error('[Email Notifications] Erreur notification nouveau matériel:', error);
            return {
                success: false,
                error: new Error(`Erreur notification matériel: ${error}`)
            };
        }
    }
    // Mise à jour du contexte (utile si l'URL de base change)
    updateContext(newContext) {
        this.context = { ...this.context, ...newContext };
        console.log('[Email Notifications] Contexte mis à jour:', this.context);
    }
}
// Instance singleton
exports.emailNotificationService = new EmailNotificationService();
