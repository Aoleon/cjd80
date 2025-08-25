import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

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
  connectionTimeoutMillis: 5000, // 5s - timeout de connexion standard
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

// Gestionnaire d'événements pour le monitoring du pool (logs réduits)
if (process.env.NODE_ENV === 'development') {
  pool.on('connect', (client) => {
    console.log(`[DB] Nouvelle connexion établie (pool: ${pool.totalCount})`);
  });
  
  pool.on('remove', (client) => {
    console.log(`[DB] Connexion fermée (pool: ${pool.totalCount})`);
  });
}

pool.on('error', (err, client) => {
  console.error('[DB] Erreur de connexion pool:', err.message);
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
