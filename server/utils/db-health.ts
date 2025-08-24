import { pool, db, getPoolStats } from '../db';
import { admins } from '@shared/schema';

/**
 * Vérifie la santé de la base de données
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  poolStats: ReturnType<typeof getPoolStats>;
  connectionTest: boolean;
  responseTime: number;
  timestamp: string;
}> {
  const startTime = Date.now();
  let connectionTest = false;
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';

  try {
    // Test de connexion simple
    await db.select().from(admins).limit(1);
    connectionTest = true;
    
    const responseTime = Date.now() - startTime;
    const poolStats = getPoolStats();
    
    // Détermination du statut basé sur les métriques
    if (connectionTest && responseTime < 500 && poolStats.waitingCount === 0) {
      status = 'healthy';
    } else if (connectionTest && responseTime < 2000 && poolStats.waitingCount < 5) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      poolStats,
      connectionTest,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[DB Health] Erreur lors du check de santé:', error);
    
    return {
      status: 'unhealthy',
      poolStats: getPoolStats(),
      connectionTest: false,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Optimise automatiquement le pool en fonction de l'utilisation
 */
export function optimizePoolUsage() {
  const stats = getPoolStats();
  
  // Log détaillé seulement toutes les 10 minutes en production
  if (process.env.NODE_ENV !== 'development' && Math.random() > 0.05) {
    return; // Skip 95% des logs en production
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB Optimizer] Statistiques actuelles:`, stats);
  }
  
  // Log seulement en développement et seulement si problème
  if (process.env.NODE_ENV === 'development') {
    // Si trop de connexions en attente, log un warning
    if (stats.waitingCount > 5) {
      console.warn(`[DB Optimizer] ${stats.waitingCount} connexions en attente - possible goulot d'étranglement`);
    }
    
    // Si le pool est presque plein, log une info
    if (stats.totalCount >= stats.maxConnections * 0.9) {
      console.info(`[DB Optimizer] Pool presque plein: ${stats.totalCount}/${stats.maxConnections} connexions`);
    }
  }
}

/**
 * Démarre le monitoring périodique du pool
 */
export function startPoolMonitoring(intervalMs: number = 60000) {
  setInterval(() => {
    optimizePoolUsage();
  }, intervalMs);
  
  console.log(`[DB Monitor] Monitoring du pool démarré (interval: ${intervalMs}ms)`);
}