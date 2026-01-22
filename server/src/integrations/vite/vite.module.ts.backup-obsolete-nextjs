import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ViteMiddleware } from './vite.middleware';
import { SpaFallbackController } from './spa-fallback.controller';

@Module({
  providers: [ViteMiddleware],
  exports: [ViteMiddleware],
  controllers: [
    // Le SpaFallbackController est toujours enregistré, mais ne fonctionne qu'en production
    // En développement, Vite gère le fallback dans main.ts
    SpaFallbackController,
  ],
})
export class ViteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Le middleware Vite sera appliqué dans main.ts après le bootstrap
    // car il nécessite l'instance HTTP server
  }
}

