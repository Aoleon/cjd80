import { Module, Global } from '@nestjs/common';
import { HealthController, StatusController } from './health.controller';
import { HealthService } from './health.service';
import { SimpleTestController } from './simple-test.controller';
import { SimpleTestService } from './simple-test.service';
import { DatabaseModule } from '../common/database/database.module';
// MinIOModule removed - MinIOService is @Optional() in HealthService

@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [HealthController, StatusController, SimpleTestController],
  providers: [HealthService, SimpleTestService],
  exports: [HealthService],
})
export class HealthModule {}

