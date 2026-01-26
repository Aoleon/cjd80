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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IdeasService } from './ideas.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('ideas')
@Controller('api/ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  // Liste publique des idées (pas de permission requise)
  @Get()
  @ApiOperation({ summary: 'Obtenir la liste des idées avec pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Numéro de page', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'idées par page', example: 20 })
  @ApiResponse({ status: 200, description: 'Liste des idées avec pagination' })
  async getIdeas(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const result = await this.ideasService.getIdeas(pageNum, limitNum);

    // Unwrap Result to match PaginatedResponse type
    if (!result.success) {
      throw new Error('error' in result ? String(result.error) : 'Failed to fetch ideas');
    }

    return {
      success: true,
      data: result.data.data,
      total: result.data.total,
      page: result.data.page,
      limit: result.data.limit,
      totalPages: Math.ceil(result.data.total / result.data.limit),
    };
  }

  // Création d'idée publique (throttled)
  @Post()
  @Throttle({ default: { limit: 20, ttl: 900000 } })
  @ApiOperation({ summary: 'Créer une nouvelle idée (publique, rate-limited)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Organiser une journée team building' },
        description: { type: 'string', example: 'Il serait intéressant d\'organiser une activité...' },
        authorName: { type: 'string', example: 'Jean Dupont' },
        authorEmail: { type: 'string', format: 'email', example: 'jean@example.com' }
      },
      required: ['title', 'description', 'authorName', 'authorEmail']
    }
  })
  @ApiResponse({ status: 201, description: 'Idée créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 429, description: 'Trop de requêtes (rate limit)' })
  async createIdea(@Body() body: unknown) {
    return await this.ideasService.createIdea(body);
  }

  // Suppression d'idée - nécessite ideas.delete (ideas_manager ou super_admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('ideas.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une idée (nécessite permission ideas.delete)' })
  @ApiParam({ name: 'id', description: 'ID de l\'idée', example: 'uuid-123' })
  @ApiResponse({ status: 204, description: 'Idée supprimée avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Idée non trouvée' })
  async deleteIdea(@Param('id') id: string) {
    await this.ideasService.deleteIdea(id);
  }

  // Mise à jour du statut - nécessite ideas.manage (ideas_manager ou super_admin)
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('ideas.manage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une idée (nécessite permission ideas.manage)' })
  @ApiParam({ name: 'id', description: 'ID de l\'idée', example: 'uuid-123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed'], example: 'approved' }
      },
      required: ['status']
    }
  })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Idée non trouvée' })
  async updateIdeaStatus(
    @Param('id') id: string,
    @Body() body: { status: unknown },
  ) {
    await this.ideasService.updateIdeaStatus(id, body.status);
  }

  // Voir les votes - nécessite ideas.read (ideas_reader, ideas_manager ou super_admin)
  @Get(':id/votes')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('ideas.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir les votes d\'une idée (nécessite permission ideas.read)' })
  @ApiParam({ name: 'id', description: 'ID de l\'idée', example: 'uuid-123' })
  @ApiResponse({ status: 200, description: 'Liste des votes pour l\'idée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Idée non trouvée' })
  async getVotesByIdea(@Param('id') id: string) {
    return await this.ideasService.getVotesByIdea(id);
  }
}

@ApiTags('ideas')
@Controller('api/votes')
export class VotesController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Voter pour une idée (publique, rate-limited)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ideaId: { type: 'string', example: 'uuid-123' },
        voterEmail: { type: 'string', format: 'email', example: 'voter@example.com' }
      },
      required: ['ideaId', 'voterEmail']
    }
  })
  @ApiResponse({ status: 201, description: 'Vote enregistré avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou vote déjà existant' })
  @ApiResponse({ status: 429, description: 'Trop de requêtes (rate limit)' })
  async createVote(@Body() body: unknown) {
    return await this.ideasService.createVote(body);
  }
}

