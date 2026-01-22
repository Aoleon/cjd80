// Test avec ConfigModule et DatabaseModule
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './common/database/database.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST2] AVANT NestFactory.create() - Config + Database');

  const app = await NestFactory.create(TestModule, {
    logger: ['log'],
  });

  console.log('[TEST2] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3002);
  console.log('[TEST2] Server listening on port 3002');
}

bootstrap().catch((error) => {
  console.error('[TEST2] ❌ Error:', error);
  process.exit(1);
});
