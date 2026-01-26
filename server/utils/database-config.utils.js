"use strict";
/**
 * Utilitaires pour la gestion de la configuration database
 * Facilite l'accès et l'utilisation de la configuration centralisée
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPoolHealth = checkPoolHealth;
exports.getPoolSummary = getPoolSummary;
exports.getPoolMetrics = getPoolMetrics;
exports.isPoolCritical = isPoolCritical;
exports.isPoolWarning = isPoolWarning;
exports.isPoolHealthy = isPoolHealthy;
exports.getAvailableConnections = getAvailableConnections;
exports.getPoolUtilizationPercent = getPoolUtilizationPercent;
exports.enrichContextWithPoolStats = enrichContextWithPoolStats;
exports.startPoolMonitoring = startPoolMonitoring;
exports.getAdditionalTimeout = getAdditionalTimeout;
exports.suggestTimeout = suggestTimeout;
const logger_1 = require("../lib/logger");
const db_1 = require("../db");
/**
 * Vérifie l'état du pool et log les alertes si nécessaire
 *
 * @example
 * const alert = checkPoolHealth();
 * if (alert) {
 *   logger.warn('Pool saturation detected', { alert });
 * }
 */
function checkPoolHealth() {
    const stats = (0, db_1.getPoolStats)();
    if (stats.critical.breached) {
        const alert = {
            severity: 'critical',
            message: `Pool SATURÉ: ${stats.utilization.percent}% utilisé (seuil critique: 90%)`,
            utilization: stats.utilization.percent,
            activeConnections: stats.activeCount,
            maxConnections: stats.maxConnections,
            waitingRequests: stats.waitingCount,
        };
        logger_1.logger.error('[DB] Pool saturation CRITICAL', alert);
        return alert;
    }
    if (stats.warning.breached) {
        const alert = {
            severity: 'warning',
            message: `Pool CHARGÉ: ${stats.utilization.percent}% utilisé (seuil warning: 70%)`,
            utilization: stats.utilization.percent,
            activeConnections: stats.activeCount,
            maxConnections: stats.maxConnections,
            waitingRequests: stats.waitingCount,
        };
        logger_1.logger.warn('[DB] Pool saturation WARNING', alert);
        return alert;
    }
    if (stats.waitingCount > 0) {
        const alert = {
            severity: 'info',
            message: `${stats.waitingCount} requête(s) en attente d'une connexion`,
            waitingRequests: stats.waitingCount,
        };
        logger_1.logger.info('[DB] Requests waiting for connection', alert);
        return alert;
    }
    return null;
}
/**
 * Retourne un résumé formaté du statut du pool
 *
 * @example
 * console.log(getPoolSummary());
 * // Output: "Pool 3/5 (60%) | 1 idle, 0 waiting"
 */
function getPoolSummary() {
    const stats = (0, db_1.getPoolStats)();
    return (`Pool ${stats.activeCount}/${stats.maxConnections} ` +
        `(${stats.utilization.percent}%) | ` +
        `${stats.idleCount} idle, ` +
        `${stats.waitingCount} waiting`);
}
/**
 * Retourne les statistiques du pool formatées pour logging
 *
 * @example
 * logger.info('Pool metrics', getPoolMetrics());
 */
function getPoolMetrics() {
    const stats = (0, db_1.getPoolStats)();
    return {
        total: stats.totalCount,
        active: stats.activeCount,
        idle: stats.idleCount,
        waiting: stats.waitingCount,
        max: stats.maxConnections,
        min: stats.minConnections,
        utilization: `${stats.utilization.percent}%`,
        status: stats.utilization.status,
        available: stats.availableConnections,
    };
}
/**
 * Vérifie si le pool est en état critique
 * Utile pour les circuit breakers ou décisions d'escalade
 */
function isPoolCritical() {
    const stats = (0, db_1.getPoolStats)();
    return stats.critical.breached;
}
/**
 * Vérifie si le pool est en état warning
 */
function isPoolWarning() {
    const stats = (0, db_1.getPoolStats)();
    return stats.warning.breached && !stats.critical.breached;
}
/**
 * Vérifie si le pool est en bon état
 */
function isPoolHealthy() {
    const stats = (0, db_1.getPoolStats)();
    return !stats.warning.breached;
}
/**
 * Retourne le nombre de connexions disponibles
 */
function getAvailableConnections() {
    return (0, db_1.getPoolStats)().availableConnections;
}
/**
 * Retourne le taux d'utilisation du pool (0-100)
 */
function getPoolUtilizationPercent() {
    return (0, db_1.getPoolStats)().utilization.percent;
}
/**
 * Crée un contexte de logging enrichi avec les stats du pool
 * Utile pour les middlewares/interceptors
 *
 * @example
 * const context = enrichContextWithPoolStats({ requestId: '123' });
 * logger.info('Request processing', context);
 */
function enrichContextWithPoolStats(context) {
    return {
        ...context,
        poolStats: getPoolMetrics(),
    };
}
/**
 * Log les statistiques du pool périodiquement (utile en development)
 * À appeler une seule fois au démarrage
 *
 * @example
 * if (process.env.NODE_ENV === 'development') {
 *   startPoolMonitoring(10000); // Log toutes les 10s
 * }
 */
function startPoolMonitoring(intervalMs = 30000) {
    return setInterval(() => {
        const alert = checkPoolHealth();
        if (!alert) {
            logger_1.logger.debug('[DB] Pool stats', getPoolMetrics());
        }
    }, intervalMs);
}
/**
 * Détermine si un timeout supplémentaire est nécessaire
 * basé sur la charge du pool
 *
 * @example
 * const baseTimeout = 5000;
 * const timeout = baseTimeout + getAdditionalTimeout();
 * // Si pool à 80%, retourne 2000, donc 7000ms total
 */
function getAdditionalTimeout() {
    const utilization = getPoolUtilizationPercent();
    if (utilization > 80) {
        return 3000; // +3s si pool chargé
    }
    if (utilization > 60) {
        return 1000; // +1s si pool partiellement chargé
    }
    return 0; // Pas de timeout supplémentaire si pool libre
}
/**
 * Suggère un timeout approprié basé sur les conditions actuelles
 * Prend en compte la charge du pool et l'environnement
 *
 * @example
 * const timeout = suggestTimeout('normal');
 * // Retourne 5000 si pool < 60%, 6000 si 60-80%, 8000 si > 80%
 */
function suggestTimeout(profile) {
    const baseTimeouts = {
        quick: 2000,
        normal: 5000,
        complex: 10000,
        background: 15000,
    };
    const baseTimeout = baseTimeouts[profile];
    const additionalTimeout = getAdditionalTimeout();
    return baseTimeout + additionalTimeout;
}
