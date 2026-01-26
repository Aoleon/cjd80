"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTANT: reflect-metadata MUST be imported first for NestJS DI to work
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const logger_1 = require("./lib/logger");
const minio_service_1 = require("./src/integrations/minio/minio.service");
const db_health_1 = require("./utils/db-health");
const auto_sync_1 = require("./utils/auto-sync");
const tracking_scheduler_1 = require("./utils/tracking-scheduler");
const vite_1 = require("./vite");
const env_validation_1 = require("./src/config/env-validation");
const graceful_shutdown_1 = require("./src/config/graceful-shutdown");
const security_middleware_1 = require("./src/config/security-middleware");
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    // 1. Valider les variables d'environnement au démarrage (fail-fast)
    logger_1.logger.info('======================================');
    logger_1.logger.info('🚀 Démarrage de l\'application CJD80');
    logger_1.logger.info('======================================');
    try {
        (0, env_validation_1.validateEnvironment)();
    }
    catch (error) {
        logger_1.logger.error('❌ Erreur de validation des variables d\'environnement', { error });
        process.exit(1);
    }
    try {
        (0, env_validation_1.checkExternalDependencies)();
    }
    catch (error) {
        logger_1.logger.error('❌ Erreur lors de la vérification des dépendances externes', { error });
        process.exit(1);
    }
    // 2. Créer l'app NestJS
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const expressApp = app.getHttpAdapter().getInstance();
    // 3. Configurer la sécurité (helmet)
    const helmetConfig = (0, security_middleware_1.getHelmetConfig)();
    if (helmetConfig) {
        const helmet = require('helmet').default;
        expressApp.use(helmet(helmetConfig));
    }
    // 4. Configurer session + Passport
    expressApp.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET || 'test-secret-dev-only',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
        }
    }));
    expressApp.use(passport_1.default.initialize());
    expressApp.use(passport_1.default.session());
    // 5. Configurer Swagger
    const config = new swagger_1.DocumentBuilder()
        .setTitle('CJD80 API')
        .setDescription('API CJD80 - Club des Jeunes Dirigeants')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    // 6. Initialiser MinIO (optionnel)
    try {
        const minioService = app.get(minio_service_1.MinIOService);
        if (minioService) {
            await minioService.ensureBuckets();
            logger_1.logger.info('[MinIO] Buckets initialized');
        }
        // Ne pas bloquer le démarrage si MinIO échoue
    }
    catch (error) {
        logger_1.logger.warn('[MinIO] Failed to initialize MinIO', { error });
        // Ne pas bloquer le démarrage si MinIO échoue
    }
    console.log('[DEBUG] MinIO initialization completed');
    // 6. Démarrer le serveur HTTP
    console.log('[DEBUG] Starting HTTP server on port', process.env.PORT || '5000');
    const port = parseInt(process.env.PORT || '5000', 10);
    const httpServer = await app.listen(port, '0.0.0.0');
    console.log('[DEBUG] HTTP server started successfully');
    logger_1.logger.info('======================================');
    logger_1.logger.info(`✅ Application démarrée avec succès`);
    logger_1.logger.info(`🌐 URL: http://0.0.0.0:${port}`);
    logger_1.logger.info(`📦 Environnement: ${process.env.NODE_ENV || 'development'}`);
    logger_1.logger.info('======================================');
    // 7. Setup Vite en développement (après le listen pour avoir le server)
    // Note: En production, les fichiers statiques sont servis par @nestjs/serve-static
    // configuré dans AppModule. Pas besoin de code Express ici.
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        try {
            await (0, vite_1.setupVite)(expressApp, httpServer);
            logger_1.logger.info('Vite middleware configured');
        }
        catch (error) {
            logger_1.logger.error('Failed to setup Vite middleware', { error });
        }
    }
    // 8. Démarrer les services en arrière-plan
    logger_1.logger.info('[Background Services] Démarrage des services en arrière-plan...');
    // Pool monitoring
    try {
        (0, db_health_1.startPoolMonitoring)();
    }
    catch (error) {
        logger_1.logger.error('[Background Services] Failed to start pool monitoring', { error });
    }
    // Auto-sync
    try {
        (0, auto_sync_1.startAutoSync)();
        logger_1.logger.info('[Background Services] Auto-sync started');
    }
    catch (error) {
        logger_1.logger.error('[Background Services] Failed to start auto-sync', { error });
    }
    // Tracking alerts generation
    try {
        (0, tracking_scheduler_1.startTrackingAlertsGeneration)();
        logger_1.logger.info('[Background Services] Tracking alerts scheduler started');
    }
    catch (error) {
        logger_1.logger.error('[Background Services] Failed to start tracking alerts scheduler', { error });
    }
    // 9. Setup graceful shutdown
    (0, graceful_shutdown_1.setupGracefulShutdown)(app);
}
bootstrap().catch((error) => {
    logger_1.logger.error('❌ Erreur fatale lors du démarrage de l\'application', { error });
    process.exit(1);
});
