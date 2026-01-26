import { Module, type NestModule, type MiddlewareConsumer } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
// ServeStaticModule n'est plus nécessaire - le SpaFallbackController gère tout
// import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { StorageModule } from './common/storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { IdeasModule } from './ideas/ideas.module';
import { EventsModule } from './events/events.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { SetupModule } from './setup/setup.module';
import { BrandingModule } from './branding/branding.module';
import { AdminModule } from './admin/admin.module';
import { MembersModule } from './members/members.module';
import { PatronsModule } from './patrons/patrons.module';
import { LoansModule } from './loans/loans.module';
import { FinancialModule } from './financial/financial.module';
import { TrackingModule } from './tracking/tracking.module';
import { FeaturesModule } from './features/features.module';
import { MinIOModule } from './integrations/minio/minio.module';
import { ViteModule } from './integrations/vite/vite.module';
import { DbMonitoringInterceptor } from './common/interceptors/db-monitoring.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Note: ServeStaticModule n'est plus utilisé
// Le fallback SPA et le service des fichiers statiques sont maintenant gérés
// entièrement par ViteModule/SpaFallbackController qui utilise un Controller NestJS
// avec @Get('*') et res.sendFile() au lieu du middleware Express ServeStaticModule

@Module({
  imports: [
    // Configuration globale (remplacé par ConfigModule personnalisé)
    ConfigModule,
    // Rate limiting global
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes par minute
      },
    ]),
    // Schedule pour les tâches cron
    ScheduleModule.forRoot(),
    // Modules de base
    DatabaseModule,
    StorageModule,
    AuthModule,
    HealthModule,
    IdeasModule,
    EventsModule,
    ChatbotModule,
    SetupModule,
    BrandingModule,
    AdminModule,
    MembersModule,
    PatronsModule,
    LoansModule,
    FinancialModule,
    TrackingModule,
    FeaturesModule,
    MinIOModule,
    // ViteModule gère le SPA fallback et les fichiers statiques via SpaFallbackController
    ViteModule,
  ],
  controllers: [],
  providers: [
    // Interceptors globaux
    {
      provide: APP_INTERCEPTOR,
      useClass: DbMonitoringInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Exception filter global
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Rate limiting guard global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // SPA fallback is now handled by ViteModule/SpaFallbackController
    // No middleware needed here
  }
}
