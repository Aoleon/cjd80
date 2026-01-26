"use strict";
/**
 * Planificateur automatique pour la génération des alertes de tracking
 *
 * Ce module gère la génération automatique des alertes de suivi transversal
 * pour les membres et mécènes inactifs ou à haut potentiel.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTrackingAlertsGeneration = startTrackingAlertsGeneration;
exports.stopTrackingAlertsGeneration = stopTrackingAlertsGeneration;
exports.isTrackingSchedulerRunning = isTrackingSchedulerRunning;
const storage_1 = require("../storage");
const logger_1 = require("../lib/logger");
let trackingInterval = null;
let isRunning = false;
/**
 * Démarre la génération automatique des alertes de tracking
 *
 * @param intervalMinutes - Intervalle en minutes entre chaque génération (défaut: 1440 = 24h)
 */
function startTrackingAlertsGeneration(intervalMinutes = 1440) {
    // Ne pas démarrer en mode test ou si déjà en cours
    if (process.env.NODE_ENV === 'test' || process.env.DISABLE_TRACKING_SCHEDULER === '1' || isRunning) {
        if (process.env.NODE_ENV !== 'test') {
            logger_1.logger.info('Tracking alerts scheduler désactivé ou déjà en cours', {
                metadata: {
                    service: 'TrackingScheduler',
                    operation: 'start',
                    disabled: process.env.DISABLE_TRACKING_SCHEDULER === '1',
                    alreadyRunning: isRunning
                }
            });
        }
        return;
    }
    // Arrêter toute instance précédente
    stopTrackingAlertsGeneration();
    // Convertir les minutes en millisecondes
    const intervalMs = intervalMinutes * 60 * 1000;
    // Exécuter immédiatement au démarrage
    generateAlerts();
    // Planifier les exécutions suivantes
    trackingInterval = setInterval(() => {
        generateAlerts();
    }, intervalMs);
    isRunning = true;
    logger_1.logger.info('Génération automatique des alertes de tracking démarrée', {
        metadata: {
            service: 'TrackingScheduler',
            operation: 'start',
            intervalMinutes,
            nextRun: new Date(Date.now() + intervalMs).toISOString()
        }
    });
}
/**
 * Arrête la génération automatique des alertes
 */
function stopTrackingAlertsGeneration() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
        isRunning = false;
        logger_1.logger.info('Génération automatique des alertes de tracking arrêtée', {
            metadata: {
                service: 'TrackingScheduler',
                operation: 'stop'
            }
        });
    }
}
/**
 * Génère les alertes de tracking
 */
async function generateAlerts() {
    try {
        logger_1.logger.info('Démarrage de la génération automatique des alertes de tracking', {
            metadata: {
                service: 'TrackingScheduler',
                operation: 'generateAlerts',
                timestamp: new Date().toISOString()
            }
        });
        const result = await storage_1.storage.generateTrackingAlerts();
        if (result.success) {
            logger_1.logger.info('Génération des alertes de tracking terminée', {
                metadata: {
                    service: 'TrackingScheduler',
                    operation: 'generateAlerts',
                    created: result.data.created,
                    errors: result.data.errors,
                    timestamp: new Date().toISOString()
                }
            });
        }
        else {
            logger_1.logger.error('Erreur lors de la génération des alertes de tracking', {
                metadata: {
                    service: 'TrackingScheduler',
                    operation: 'generateAlerts',
                    error: 'error' in result ? result.error.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Exception lors de la génération des alertes de tracking', {
            metadata: {
                service: 'TrackingScheduler',
                operation: 'generateAlerts',
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            }
        });
    }
}
/**
 * Vérifie si le planificateur est en cours d'exécution
 */
function isTrackingSchedulerRunning() {
    return isRunning;
}
