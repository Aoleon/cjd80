import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ViteMiddleware } from './vite.middleware';

@Module({
  providers: [ViteMiddleware],
  exports: [ViteMiddleware],
})
export class ViteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Le middleware Vite sera appliqué dans main.ts après le bootstrap
    // car il nécessite l'instance HTTP server
  }
}

