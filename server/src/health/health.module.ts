import { Module } from '@nestjs/common';
import { HealthController, StatusController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseModule } from '../common/database/database.module';
import { MinIOModule } from '../integrations/minio/minio.module';

@Module({
  imports: [DatabaseModule, MinIOModule],
  controllers: [HealthController, StatusController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}

