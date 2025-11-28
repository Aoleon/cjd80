import { z } from 'zod';
import { logger } from '../../lib/logger';

/**
 * Schéma de validation des variables d'environnement
 * Valide les variables critiques au démarrage pour fail-fast
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  
  // Base de données (CRITIQUE)
  DATABASE_URL: z.string().url().min(1, 'DATABASE_URL est requis'),
  
  // Session (CRITIQUE en production)
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET doit faire au moins 32 caractères')
    .refine((val) => {
      if (process.env.NODE_ENV === 'production') {
        return val !== 'your-secret-key-change-in-production' && val !== 'your-secret-session-key-change-this';
      }
      return true;
    }, 'SESSION_SECRET doit être changé en production'),
  
  // Authentik OAuth2 (CRITIQUE)
  AUTHENTIK_BASE_URL: z.string().url().default('http://localhost:9002'),
  AUTHENTIK_CLIENT_ID: z.string().min(1, 'AUTHENTIK_CLIENT_ID est requis'),
  AUTHENTIK_CLIENT_SECRET: z.string().min(1, 'AUTHENTIK_CLIENT_SECRET est requis'),
  AUTHENTIK_REDIRECT_URI: z.string().url().default('http://localhost:5000/api/auth/authentik/callback'),
  AUTHENTIK_TOKEN: z.string().optional(),
  
  // MinIO (OPTIONNEL mais recommandé)
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.string().regex(/^\d+$/).transform(Number).default('9000'),
  MINIO_USE_SSL: z.string().transform(val => val === 'true').default('false'),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET_LOAN_ITEMS: z.string().default('loan-items'),
  MINIO_BUCKET_ASSETS: z.string().default('assets'),
  
  // Email (OPTIONNEL)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // VAPID (OPTIONNEL)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  
  // OpenAI (OPTIONNEL)
  OPENAI_API_KEY: z.string().optional(),
  
  // GitHub (OPTIONNEL)
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_REPO_OWNER: z.string().optional(),
  GITHUB_REPO_NAME: z.string().optional(),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Valide les variables d'environnement au démarrage
 * Fail-fast si des variables critiques sont manquantes ou invalides
 */
export function validateEnvironment(): ValidatedEnv {
  try {
    logger.info('[Env Validation] Début de la validation des variables d\'environnement...');
    
    const result = envSchema.safeParse(process.env);
    
    if (!result.success) {
      logger.error('[Env Validation] Variables d\'environnement invalides', {
        errors: result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      });
      
      // En production, on fail-fast
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Environment validation failed. Check logs for details.');
      } else {
        logger.warn('[Env Validation] Variables invalides mais on continue en développement');
        // En dev, on retourne les valeurs par défaut
        return envSchema.parse(process.env);
      }
    }
    
    logger.info('[Env Validation] ✅ Toutes les variables d\'environnement sont valides');
    
    // Log des variables importantes (masquées pour sécurité)
    logger.info('[Env Validation] Configuration chargée:', {
      nodeEnv: result.data.NODE_ENV,
      port: result.data.PORT,
      databaseUrl: maskUrl(result.data.DATABASE_URL),
      authentikConfigured: !!result.data.AUTHENTIK_CLIENT_ID,
      minioConfigured: result.data.MINIO_ENDPOINT !== 'localhost',
      smtpConfigured: !!result.data.SMTP_HOST,
      vapidConfigured: !!result.data.VAPID_PUBLIC_KEY,
      openaiConfigured: !!result.data.OPENAI_API_KEY,
      githubConfigured: !!result.data.GITHUB_TOKEN,
    });
    
    return result.data;
  } catch (error) {
    logger.error('[Env Validation] Erreur fatale lors de la validation', { error });
    throw error;
  }
}

/**
 * Masque les informations sensibles dans une URL
 */
function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '***';
    }
    if (parsed.username) {
      parsed.username = '***';
    }
    return parsed.toString();
  } catch {
    return '***';
  }
}

/**
 * Vérifie les dépendances externes au démarrage
 */
export async function checkExternalDependencies(): Promise<{
  database: boolean;
  minio: boolean;
  authentik: boolean;
}> {
  const results = {
    database: false,
    minio: false,
    authentik: false,
  };
  
  // Check database
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      // Simple ping test (sera fait par le pool au démarrage)
      results.database = true;
      logger.info('[Dependency Check] ✅ Database URL configurée');
    }
  } catch (error) {
    logger.warn('[Dependency Check] ⚠️ Database check failed', { error });
  }
  
  // Check MinIO
  try {
    const minioEndpoint = process.env.MINIO_ENDPOINT;
    if (minioEndpoint && minioEndpoint !== 'localhost') {
      results.minio = true;
      logger.info('[Dependency Check] ✅ MinIO configuré');
    } else {
      logger.warn('[Dependency Check] ⚠️ MinIO non configuré ou en local');
    }
  } catch (error) {
    logger.warn('[Dependency Check] ⚠️ MinIO check failed', { error });
  }
  
  // Check Authentik
  try {
    const authentikBaseUrl = process.env.AUTHENTIK_BASE_URL;
    if (authentikBaseUrl && authentikBaseUrl !== 'http://localhost:9002') {
      results.authentik = true;
      logger.info('[Dependency Check] ✅ Authentik configuré');
    } else {
      logger.warn('[Dependency Check] ⚠️ Authentik en configuration locale');
    }
  } catch (error) {
    logger.warn('[Dependency Check] ⚠️ Authentik check failed', { error });
  }
  
  return results;
}
