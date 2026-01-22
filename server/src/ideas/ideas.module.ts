import { Module } from '@nestjs/common';
import { IdeasController, VotesController } from './ideas.controller';
import { IdeasService } from './ideas.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [IdeasController, VotesController],
  providers: [IdeasService],
  exports: [IdeasService],
})
export class IdeasModule {}

