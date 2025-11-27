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
import { Throttle } from '@nestjs/throttler';
import { IdeasService } from './ideas.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('api/ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get()
  async getIdeas(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.ideasService.getIdeas(pageNum, limitNum);
  }

  @Post()
  @Throttle({ default: { limit: 20, ttl: 900000 } })
  async createIdea(@Body() body: unknown) {
    return await this.ideasService.createIdea(body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIdea(@Param('id') id: string) {
    await this.ideasService.deleteIdea(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateIdeaStatus(
    @Param('id') id: string,
    @Body() body: { status: unknown },
  ) {
    await this.ideasService.updateIdeaStatus(id, body.status);
  }

  @Get(':id/votes')
  @UseGuards(JwtAuthGuard)
  async getVotesByIdea(@Param('id') id: string) {
    return await this.ideasService.getVotesByIdea(id);
  }
}

@Controller('api/votes')
export class VotesController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createVote(@Body() body: unknown) {
    return await this.ideasService.createVote(body);
  }
}

