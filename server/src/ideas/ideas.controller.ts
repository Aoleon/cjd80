import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IdeasService } from './ideas.service';
import { JwtAuthGuard } from '@robinswood/auth';
import { Public } from '../auth/decorators/public.decorator';
// import { PermissionsGuard } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
// import { RequirePermission } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter

@Controller('api/ideas')
export class IdeasController {
  constructor(@Inject(IdeasService) private readonly ideasService: IdeasService) {}

  // Liste publique des idées (pas de permission requise)
  @Public()
  @Get()
  async getIdeas(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.ideasService.getIdeas(pageNum, limitNum);
  }

  // Création d'idée publique (throttled)
  @Public()
  @Post()
  @Throttle({ default: { limit: 20, ttl: 900000 } })
  async createIdea(@Body() body: unknown) {
    return await this.ideasService.createIdea(body);
  }

  // Suppression d'idée - nécessite ideas.delete (ideas_manager ou super_admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
  // @RequirePermission // TODO: Restore('ideas.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIdea(@Param('id') id: string) {
    await this.ideasService.deleteIdea(id);
  }

  // Mise à jour du statut - nécessite ideas.manage (ideas_manager ou super_admin)
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
  // @RequirePermission // TODO: Restore('ideas.manage')
  async updateIdeaStatus(
    @Param('id') id: string,
    @Body() body: { status: unknown },
  ) {
    await this.ideasService.updateIdeaStatus(id, body.status);
  }

  // Voir les votes - nécessite ideas.read (ideas_reader, ideas_manager ou super_admin)
  @Get(':id/votes')
  @UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
  // @RequirePermission // TODO: Restore('ideas.read')
  async getVotesByIdea(@Param('id') id: string) {
    return await this.ideasService.getVotesByIdea(id);
  }
}

@Controller('api/votes')
export class VotesController {
  constructor(@Inject(IdeasService) private readonly ideasService: IdeasService) {}

  @Public()
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createVote(@Body() body: unknown) {
    return await this.ideasService.createVote(body);
  }
}

