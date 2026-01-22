// Test ultra-minimal - Juste Config + Database + Storage
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { StorageModule } from './common/storage/storage.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    StorageModule,
  ],
  controllers: [],
  providers: [],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST6] AVANT NestFactory.create() - Config + Database + Storage');

  const app = await NestFactory.create(TestModule, {
    logger: ['log'],
  });

  console.log('[TEST6] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3006);
  console.log('[TEST6] Server listening on port 3006');
}

bootstrap().catch((error) => {
  console.error('[TEST6] ❌ Error:', error);
  process.exit(1);
});
