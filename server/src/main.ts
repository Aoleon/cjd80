// IMPORTANT: reflect-metadata MUST be imported first for NestJS DI to work
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from '../lib/logger';
import { MinIOService } from './integrations/minio/minio.service';
import { startPoolMonitoring } from '../utils/db-health';
import { startAutoSync } from '../utils/auto-sync';
import { startTrackingAlertsGeneration } from '../utils/tracking-scheduler';
import { setupVite } from '../vite';
import { AuthService } from './auth/auth.service';
import { validateEnvironment, checkExternalDependencies } from './config/env-validation';
import { setupGracefulShutdown, rejectDuringShutdown } from './config/graceful-shutdown';
import { getHelmetConfig } from './config/security-middleware';
import session from 'express-session';
import passport from 'passport';
import type { Express } from 'express';
// Import types for Express.User extension
import type { Admin } from '@shared/schema';

async function bootstrap() {
  // 1. Valider les variables d'environnement au démarrage (fail-fast)
  logger.info('======================================');
  logger.info('🚀 Démarrage de l\'application CJD80');
  logger.info('======================================');
  
  try {
    validateEnvironment();
  } catch (error) {
    logger.error('❌ Validation des variables d\'environnement échouée', { error });
    process.exit(1);
  }
  
  // 2. Vérifier les dépendances externes
  logger.info('[Startup] Vérification des dépendances externes...');
  const dependencies = await checkExternalDependencies();
  logger.info('[Startup] État des dépendances:', dependencies);
  // 3. Créer l'application NestJS
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'development' ? ['log', 'error', 'warn', 'debug'] : ['error', 'warn'],
  });

  // 4. Configuration de sécurité
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  
  // Trust proxy pour les headers X-Forwarded-* (important derrière Traefik/nginx)
  expressApp.set('trust proxy', 1);
  
  // Headers de sécurité HTTP avec Helmet
  const helmet = getHelmetConfig();
  expressApp.use(helmet);
  logger.info('[Security] ✅ Headers de sécurité HTTP configurés');
  
  // Middleware pour rejeter les requêtes pendant le shutdown
  expressApp.use(rejectDuringShutdown());
  
  // 5. Configuration CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });
  logger.info('[CORS] Origine autorisée:', process.env.CORS_ORIGIN || '*');

  // Configurer les sessions Express et Passport
  // Récupérer la configuration de session depuis AuthModule
  const sessionConfig = app.get('SESSION_CONFIG');
  expressApp.use(session(sessionConfig));
  expressApp.use(passport.initialize());
  expressApp.use(passport.session());

  // Configurer Passport serialize/deserialize
  const authService = app.get(AuthService);
  passport.serializeUser((user: Express.User, done) => {
    done(null, authService.serializeUser(user));
  });
  passport.deserializeUser(async (email: string, done) => {
    try {
      const user = await authService.deserializeUser(email);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Initialiser MinIO au démarrage
  try {
    const minioService = app.get(MinIOService);
    await minioService.initialize();
    logger.info('MinIO service initialized at startup');
  } catch (error) {
    logger.error('Failed to initialize MinIO service at startup', { error });
    // Ne pas bloquer le démarrage si MinIO échoue
  }

  // 6. Démarrer le serveur HTTP
  const port = parseInt(process.env.PORT || '5000', 10);
  const httpServer = await app.listen(port, '0.0.0.0');
  
  logger.info('======================================');
  logger.info(`✅ Application démarrée avec succès`);
  logger.info(`🌐 URL: http://0.0.0.0:${port}`);
  logger.info(`📦 Environnement: ${process.env.NODE_ENV || 'development'}`);
  logger.info('======================================');

  // 7. Setup Vite en développement (après le listen pour avoir le server)
  // Note: En production, les fichiers statiques sont servis par @nestjs/serve-static
  // configuré dans AppModule. Pas besoin de code Express ici.
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    try {
      await setupVite(expressApp, httpServer);
      logger.info('Vite middleware configured');
    } catch (error) {
      logger.error('Failed to setup Vite middleware', { error });
    }
  }

  // 8. Démarrer les services en arrière-plan
  logger.info('[Background Services] Démarrage des services en arrière-plan...');
  
  // Démarrer le monitoring du pool de connexions
  const monitoringInterval = process.env.NODE_ENV === 'development' ? 300000 : 600000;
  startPoolMonitoring(monitoringInterval);

  // Démarrer la synchronisation automatique GitHub
  startAutoSync();

  // Démarrer la génération automatique des alertes de tracking
  const trackingInterval = parseInt(process.env.TRACKING_ALERTS_INTERVAL_MINUTES || '1440', 10);
  startTrackingAlertsGeneration(trackingInterval);
  
  logger.info('[Background Services] ✅ Tous les services en arrière-plan sont démarrés');
  
  // 9. Configurer le graceful shutdown
  setupGracefulShutdown(app);
  
  logger.info('======================================');
  logger.info('✅ Application prête à recevoir du trafic');
  logger.info('======================================');
}

bootstrap().catch((error) => {
  logger.error('❌ Erreur fatale lors du démarrage de l\'application', { error });
  process.exit(1);
});
