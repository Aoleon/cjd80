/**
 * tRPC Module - Module NestJS pour tRPC
 *
 * Configure et expose le service tRPC
 */

import { Module } from '@nestjs/common'
import { TRPCController } from './trpc.controller'
import { TRPCService } from './trpc.service'
import { IdeasModule } from '../ideas/ideas.module'
import { EventsModule } from '../events/events.module'

@Module({
  imports: [
    IdeasModule, // Pour injecter IdeasService
    EventsModule, // Pour injecter EventsService
  ],
  controllers: [TRPCController],
  providers: [TRPCService],
  exports: [TRPCService],
})
export class TRPCModule {}
