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
  // Réduit pour éviter les connexions inutiles avec Neon serverless
  max: 5, // Maximum 5 connexions simultanées (optimisé pour Neon)
  min: 1,  // Minimum 1 connexion maintenue
  // Timeouts réduits pour des connexions plus rapides
  idleTimeoutMillis: 10000, // 10s - ferme rapidement les connexions inactives
  connectionTimeoutMillis: 3000, // 3s - timeout de connexion réduit
  // Gestion des erreurs de connexion
  maxUses: 7500, // Recycle les connexions après 7500 utilisations
  // Pool de requêtes pour éviter les blocages
  allowExitOnIdle: true,
  // Configuration spécifique à l'environnement
  application_name: 'cjd-amiens-app',
  // Optimisations pour Neon serverless
  statement_timeout: 10000, // 10s timeout pour éviter les blocages
  query_timeout: 5000, // 5s timeout par défaut
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
  maxConnections: 5, // Configuration optimisée
  minConnections: 1
});

// Graceful shutdown du pool
process.on('SIGTERM', async () => {
  console.log('[DB] Fermeture gracieuse du pool de connexions...');
  await pool.end();
  console.log('[DB] Pool fermé');
});
