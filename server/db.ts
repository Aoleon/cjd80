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

// Configuration optimisée du pool de connexions
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Taille du pool optimisée pour une application web interne
  max: 20, // Maximum 20 connexions simultanées
  min: 2,  // Minimum 2 connexions maintenues
  // Timeouts optimisés
  idleTimeoutMillis: 30000, // 30s - ferme les connexions inactives
  connectionTimeoutMillis: 5000, // 5s - timeout de connexion
  // Gestion des erreurs de connexion
  maxUses: 7500, // Recycle les connexions après 7500 utilisations
  // Pool de requêtes pour éviter les blocages
  allowExitOnIdle: true,
  // Configuration spécifique à l'environnement
  application_name: 'cjd-amiens-app',
  // Optimisations pour Neon serverless
  statement_timeout: 30000, // 30s timeout pour les requêtes longues
  query_timeout: 10000, // 10s timeout par défaut
};

export const pool = new Pool(poolConfig);

// Gestionnaire d'événements pour le monitoring du pool
pool.on('connect', (client) => {
  console.log(`[DB] Nouvelle connexion établie (pool: ${pool.totalCount})`);
});

pool.on('error', (err, client) => {
  console.error('[DB] Erreur de connexion pool:', err.message);
});

pool.on('remove', (client) => {
  console.log(`[DB] Connexion fermée (pool: ${pool.totalCount})`);
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
  maxConnections: 20, // Configuration statique
  minConnections: 2
});

// Graceful shutdown du pool
process.on('SIGTERM', async () => {
  console.log('[DB] Fermeture gracieuse du pool de connexions...');
  await pool.end();
  console.log('[DB] Pool fermé');
});
