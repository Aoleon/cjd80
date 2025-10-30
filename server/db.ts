import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { logger } from "./lib/logger";
import { DatabaseResilience } from "./lib/db-resilience";

// Configuration optimisée pour Neon PostgreSQL
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true; // Utilise fetch pour les requêtes courtes
neonConfig.fetchEndpoint = (host) => `https://${host}/sql`; // Point de terminaison optimisé

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuration optimisée du pool de connexions pour Neon
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Configuration optimisée pour éviter les cold starts
  max: 20, // Plus de connexions pour gérer les pics de charge
  min: 2,  // Maintenir 2 connexions chaudes minimum
  // Timeouts optimisés pour garder les connexions chaudes
  idleTimeoutMillis: 60000, // 60s - garde les connexions chaudes plus longtemps
  connectionTimeoutMillis: 3000, // 3s - timeout de connexion réduit pour fail-fast
  // Gestion des erreurs de connexion
  maxUses: 10000, // Recycle les connexions après 10000 utilisations
  // Pool de requêtes pour éviter les blocages
  allowExitOnIdle: false, // Garde le pool actif
  // Configuration spécifique à l'environnement
  application_name: 'cjd-amiens-app',
  // Optimisations pour Neon serverless
  statement_timeout: 30000, // 30s timeout pour les requêtes complexes
  query_timeout: 10000, // 10s timeout par défaut
};

export const pool = new Pool(poolConfig);

// Couche de résilience avec circuit breaker et retry logic
export const dbResilience = new DatabaseResilience(pool, 'neon-database');

// Gestionnaire d'événements pour le monitoring du pool (logs réduits)
if (process.env.NODE_ENV === 'development') {
  pool.on('connect', (client) => {
    console.log(`[DB] Nouvelle connexion établie (pool: ${pool.totalCount})`);
  });
  
  pool.on('remove', (client) => {
    console.log(`[DB] Connexion fermée (pool: ${pool.totalCount})`);
  });
}

pool.on('error', (err: Error, client: any) => {
  logger.error('CRITICAL: Database pool error', {
    type: 'dbPoolError',
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    poolStats: {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    }
  });
});

// Configuration Drizzle avec optimisations
export const db = drizzle({ 
  client: pool, 
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
export const getPoolStats = () => ({
  totalCount: pool.totalCount,
  idleCount: pool.idleCount,
  waitingCount: pool.waitingCount,
  maxConnections: 20, // Configuration optimisée
  minConnections: 2
});

// Graceful shutdown du pool
process.on('SIGTERM', async () => {
  console.log('[DB] Fermeture gracieuse du pool de connexions...');
  await pool.end();
  console.log('[DB] Pool fermé');
});
