// Test avec ThrottlerModule et ScheduleModule
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST3] AVANT NestFactory.create() - Throttler + Schedule');

  const app = await NestFactory.create(TestModule, {
    logger: ['log'],
  });

  console.log('[TEST3] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3003);
  console.log('[TEST3] Server listening on port 3003');
}

bootstrap().catch((error) => {
  console.error('[TEST3] ❌ Error:', error);
  process.exit(1);
});
