import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from '../lib/logger';
import { MinIOService } from './integrations/minio/minio.service';
import { startPoolMonitoring } from '../utils/db-health';
import { startAutoSync } from '../utils/auto-sync';
import { startTrackingAlertsGeneration } from '../utils/tracking-scheduler';
import { setupVite } from '../vite';
import { AuthService } from './auth/auth.service';
import session from 'express-session';
import passport from 'passport';
import type { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'development' ? ['log', 'error', 'warn', 'debug'] : ['error', 'warn'],
  });

  // Configuration CORS si nécessaire
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Trust proxy pour les headers X-Forwarded-*
  // Dans NestJS, on configure cela via l'Express adapter
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', 1);

  // Configurer les sessions Express et Passport
  // Récupérer la configuration de session depuis AuthModule
  const sessionConfig = app.get('SESSION_CONFIG');
  expressApp.use(session(sessionConfig));
  expressApp.use(passport.initialize());
  expressApp.use(passport.session());

  // Configurer Passport serialize/deserialize
  const authService = app.get(AuthService);
  passport.serializeUser((user: any, done) => {
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

  const port = parseInt(process.env.PORT || '5000', 10);
  const httpServer = await app.listen(port, '0.0.0.0');

  // Setup Vite en développement (après le listen pour avoir le server)
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    try {
      await setupVite(expressApp, httpServer);
      logger.info('Vite middleware configured');
    } catch (error) {
      logger.error('Failed to setup Vite middleware', { error });
    }
  } else {
    // En production, servir les fichiers statiques
    const expressStatic = (await import('express')).default.static;
    const distPath = path.join(__dirname, '../../dist/public');
    expressApp.use(expressStatic(distPath));
    
    // Fallback pour SPA
    expressApp.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).end();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  logger.info(`Application is running on: http://0.0.0.0:${port}`);
  logger.info('DB pool monitoring activé');

  // Démarrer le monitoring du pool de connexions
  const monitoringInterval = process.env.NODE_ENV === 'development' ? 300000 : 600000;
  startPoolMonitoring(monitoringInterval);

  // Démarrer la synchronisation automatique GitHub
  startAutoSync();

  // Démarrer la génération automatique des alertes de tracking
  const trackingInterval = parseInt(process.env.TRACKING_ALERTS_INTERVAL_MINUTES || '1440', 10);
  startTrackingAlertsGeneration(trackingInterval);
}

bootstrap().catch((error) => {
  logger.error('Failed to start application', { error });
  process.exit(1);
});
