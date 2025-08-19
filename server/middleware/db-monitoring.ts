import { Request, Response, NextFunction } from 'express';
import { getPoolStats } from '../db';

// Middleware pour monitorer les performances de la base de données
export const dbMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log des statistiques du pool avant la requête
  if (process.env.NODE_ENV === 'development') {
    const stats = getPoolStats();
    console.log(`[DB Monitor] Pool stats: ${stats.idleCount}/${stats.totalCount} connexions (${stats.waitingCount} en attente)`);
  }
  
  // Intercept la fin de la réponse pour mesurer le temps
  const originalSend = res.send;
  res.send = function(data) {
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

// Endpoint pour les statistiques du pool (admin seulement)
export const getPoolStatsEndpoint = (req: Request, res: Response) => {
  const stats = getPoolStats();
  
  res.json({
    pool: stats,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
};