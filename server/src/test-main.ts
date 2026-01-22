// Test minimal bootstrap
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
class MinimalModule {}

async function bootstrap() {
  console.log('[TEST] AVANT NestFactory.create()');

  const app = await NestFactory.create(MinimalModule, {
    logger: ['log'],
  });

  console.log('[TEST] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3001);
  console.log('[TEST] Server listening on port 3001');
}

bootstrap().catch((error) => {
  console.error('[TEST] ❌ Error:', error);
  process.exit(1);
});
