import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";
import { logger } from "./lib/logger";
import { DatabaseResilience } from "./lib/db-resilience";

// ========================================
// DÉTECTION AUTOMATIQUE DU PROVIDER
// ========================================

/**
 * Détecte le type de provider PostgreSQL basé sur DATABASE_URL
 * - Neon: contient "neon.tech" (utilise neon-serverless)
 * - Supabase/Standard PostgreSQL: format postgresql:// standard (utilise node-postgres)
 */
function detectDatabaseProvider(): 'neon' | 'standard' {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  // Détection Neon (serverless avec WebSocket)
  if (databaseUrl.includes('neon.tech')) {
    return 'neon';
  }

  // Tout le reste est considéré comme PostgreSQL standard (Supabase ou autre)
  return 'standard';
}

const dbProvider = detectDatabaseProvider();

// Configuration Neon (seulement si provider est Neon)
if (dbProvider === 'neon') {
  neonConfig.webSocketConstructor = ws;
  neonConfig.poolQueryViaFetch = true;
  neonConfig.fetchEndpoint = (host) => `https://${host}/sql`;
}

// ========================================
// CONFIGURATION DU POOL DE CONNEXIONS
// ========================================

let pool: NeonPool | PgPool;
let dbResilience: DatabaseResilience;

if (dbProvider === 'neon') {
  // Pool Neon (serverless avec WebSocket)
  const neonPool = new NeonPool({
    connectionString: process.env.DATABASE_URL!,
    max: 20,
    min: 2,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 3000,
    maxUses: 10000,
    allowExitOnIdle: false,
  });
  pool = neonPool;
  dbResilience = new DatabaseResilience(neonPool as any, 'neon-database');
} else {
  // Pool PostgreSQL standard (Supabase ou autre)
  const pgPool = new PgPool({
    connectionString: process.env.DATABASE_URL!,
    max: 20,
    min: 2,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 3000,
    application_name: 'cjd-amiens-app',
  });
  pool = pgPool;
  dbResilience = new DatabaseResilience(pgPool as any, 'postgresql-database');
}

export { pool, dbResilience };

// Gestionnaire d'événements pour le monitoring du pool (logs réduits)
if (process.env.NODE_ENV === 'development') {
  if (dbProvider === 'neon') {
    (pool as NeonPool).on('connect', () => {
      const stats = { totalCount: (pool as NeonPool).totalCount };
      console.log(`[DB] Nouvelle connexion établie (provider: ${dbProvider}, pool: ${stats.totalCount})`);
    });
    
    (pool as NeonPool).on('remove', () => {
      const stats = { totalCount: (pool as NeonPool).totalCount };
      console.log(`[DB] Connexion fermée (provider: ${dbProvider}, pool: ${stats.totalCount})`);
    });
  } else {
    (pool as PgPool).on('connect', () => {
      const stats = { totalCount: (pool as PgPool).totalCount };
      console.log(`[DB] Nouvelle connexion établie (provider: ${dbProvider}, pool: ${stats.totalCount})`);
    });
    
    (pool as PgPool).on('remove', () => {
      const stats = { totalCount: (pool as PgPool).totalCount };
      console.log(`[DB] Connexion fermée (provider: ${dbProvider}, pool: ${stats.totalCount})`);
    });
  }
}

// Gestion des erreurs du pool (compatible Neon et pg)
if (dbProvider === 'neon') {
  (pool as NeonPool).on('error', (err: Error, client: any) => {
    const stats = {
      totalCount: (pool as NeonPool).totalCount,
      idleCount: (pool as NeonPool).idleCount,
      waitingCount: (pool as NeonPool).waitingCount
    };
    
    logger.error('CRITICAL: Database pool error', {
      type: 'dbPoolError',
      provider: dbProvider,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      poolStats: stats
    });
  });
} else {
  (pool as PgPool).on('error', (err: Error, client: any) => {
    const stats = {
      totalCount: (pool as PgPool).totalCount,
      idleCount: (pool as PgPool).idleCount,
      waitingCount: (pool as PgPool).waitingCount
    };
    
    logger.error('CRITICAL: Database pool error', {
      type: 'dbPoolError',
      provider: dbProvider,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      poolStats: stats
    });
  });
}

// Configuration Drizzle avec optimisations
export const db = dbProvider === 'neon'
  ? drizzleNeon({ 
      client: pool as NeonPool, 
      schema,
      logger: process.env.NODE_ENV === 'development' ? {
        logQuery: (query, params) => {
          console.log(`[DB Query] ${query.slice(0, 100)}...`);
        }
      } : false
    })
  : drizzlePg({ 
      client: pool as PgPool, 
      schema,
      logger: process.env.NODE_ENV === 'development' ? {
        logQuery: (query, params) => {
          console.log(`[DB Query] ${query.slice(0, 100)}...`);
        }
      } : false
    });

// Profils de timeout pour différents types de requêtes
export const QUERY_TIMEOUT_PROFILES = {
  quick: {
    timeout: 2000,    // 2s - Pour les requêtes simples (SELECT simple, COUNT)
    retry: false
  },
  normal: {
    timeout: 5000,    // 5s - Pour les requêtes standards (SELECT avec JOIN)
    retry: true
  },
  complex: {
    timeout: 10000,   // 10s - Pour les requêtes complexes (INSERT/UPDATE/DELETE)
    retry: true
  },
  background: {
    timeout: 15000,   // 15s - Pour les tâches background non-critiques
    retry: true
  }
} as const;

export type QueryTimeoutProfile = keyof typeof QUERY_TIMEOUT_PROFILES;

/**
 * Wrapper pour exécuter des requêtes DB avec protection circuit breaker
 * 
 * @param queryFn - Fonction qui exécute la requête DB
 * @param profile - Profil de timeout ('quick' | 'normal' | 'complex' | 'background')
 * @returns Résultat de la requête
 * 
 * @example
 * // Requête rapide (2s timeout, pas de retry)
 * const count = await runDbQuery(
 *   async () => db.select().from(users).limit(1),
 *   'quick'
 * );
 * 
 * @example
 * // Requête normale (5s timeout, avec retry)
 * const users = await runDbQuery(
 *   async () => db.select().from(users).where(eq(users.email, email)),
 *   'normal'
 * );
 */
export async function runDbQuery<T>(
  queryFn: () => Promise<T>,
  profile: QueryTimeoutProfile = 'normal'
): Promise<T> {
  const config = QUERY_TIMEOUT_PROFILES[profile];
  
  return dbResilience.executeQuery(queryFn, {
    timeout: config.timeout,
    retry: config.retry
  });
}

// Fonction utilitaire pour obtenir les statistiques du pool
export const getPoolStats = () => {
  const stats = dbProvider === 'neon'
    ? {
        totalCount: (pool as NeonPool).totalCount,
        idleCount: (pool as NeonPool).idleCount,
        waitingCount: (pool as NeonPool).waitingCount,
      }
    : {
        totalCount: (pool as PgPool).totalCount,
        idleCount: (pool as PgPool).idleCount,
        waitingCount: (pool as PgPool).waitingCount,
      };
  
  return {
    ...stats,
    provider: dbProvider,
    maxConnections: 20,
    minConnections: 2
  };
};

// Graceful shutdown du pool
process.on('SIGTERM', async () => {
  console.log('[DB] Fermeture gracieuse du pool de connexions...');
  await pool.end();
  console.log('[DB] Pool fermé');
});
