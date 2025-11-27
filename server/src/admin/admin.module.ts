import { Module } from '@nestjs/common';
import { AdminController, LogsController } from './admin.controller';
import { AdminService } from './admin.service';
import { StorageModule } from '../common/storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { IdeasModule } from '../ideas/ideas.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [StorageModule, AuthModule, IdeasModule, EventsModule],
  controllers: [AdminController, LogsController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

