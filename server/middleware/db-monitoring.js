"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolStatsEndpoint = exports.dbMonitoringMiddleware = void 0;
const db_1 = require("../db");
// Middleware pour monitorer les performances de la base de données
const dbMonitoringMiddleware = (req, res, next) => {
    const startTime = Date.now();
    // Log des statistiques du pool avant la requête
    if (process.env.NODE_ENV === 'development') {
        const stats = (0, db_1.getPoolStats)();
        console.log(`[DB Monitor] Pool stats: ${stats.idleCount}/${stats.totalCount} connexions (${stats.waitingCount} en attente)`);
    }
    // Intercept la fin de la réponse pour mesurer le temps
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        // Log des requêtes lentes (> 1 seconde)
        if (duration > 1000) {
            console.warn(`[DB Monitor] Requête lente détectée: ${req.method} ${req.path} - ${duration}ms`);
        }
        // Log en mode développement
        if (process.env.NODE_ENV === 'development' && duration > 100) {
            console.log(`[DB Monitor] ${req.method} ${req.path} - ${duration}ms`);
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.dbMonitoringMiddleware = dbMonitoringMiddleware;
// Endpoint pour les statistiques du pool (admin seulement)
const getPoolStatsEndpoint = (req, res) => {
    const stats = (0, db_1.getPoolStats)();
    res.json({
        pool: stats,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
};
exports.getPoolStatsEndpoint = getPoolStatsEndpoint;
