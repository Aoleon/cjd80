import {
  Controller,
  Get,
  Post,
  Put,
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
import { EventsService } from './events.service';
import { JwtAuthGuard } from '@robinswood/auth';
import { Public } from '../auth/decorators/public.decorator';
// import { PermissionsGuard } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
// import { RequirePermission } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
import { User } from '@robinswood/auth';

@Controller('api/events')
export class EventsController {
  constructor(@Inject(EventsService) private readonly eventsService: EventsService) {}

  // Liste publique des événements (pas de permission requise)
  @Public()
  @Get()
  async getEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.eventsService.getEvents(pageNum, limitNum);
  }

  // Création d'événement - nécessite events.write (events_manager ou super_admin)
  @Post()
  @UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
  // @RequirePermission // TODO: Restore('events.write')
  async createEvent(@Body() body: unknown, @User() user: any) {
    return await this.eventsService.createEvent(body, user);
  }

  // Création d'événement avec inscriptions - nécessite events.write (events_manager ou super_admin)
  @Post('with-inscriptions')
  @UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
  // @RequirePermission // TODO: Restore('events.write')
  async createEventWithInscriptions(@Body() body: unknown, @User() user: any) {
    return await this.eventsService.createEventWithInscriptions(body, user);
  }

  // Mise à jour d'événement - nécessite events.write (events_manager ou super_admin)
  @Put(':id')
  @UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
  // @RequirePermission // TODO: Restore('events.write')
  async updateEvent(@Param('id') id: string, @Body() body: unknown) {
    return await this.eventsService.updateEvent(id, body);
  }

  // Suppression d'événement - nécessite events.delete (events_manager ou super_admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
  // @RequirePermission // TODO: Restore('events.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id') id: string) {
    await this.eventsService.deleteEvent(id);
  }

  // Voir les inscriptions - nécessite events.read (events_reader, events_manager ou super_admin)
  @Get(':id/inscriptions')
  @UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
  // @RequirePermission // TODO: Restore('events.read')
  async getEventInscriptions(@Param('id') id: string) {
    return await this.eventsService.getEventInscriptions(id);
  }
}

@Controller('api/inscriptions')
export class InscriptionsController {
  constructor(@Inject(EventsService) private readonly eventsService: EventsService) {}

  @Public()
  @Post()
  @Throttle({ default: { limit: 20, ttl: 900000 } })
  async createInscription(@Body() body: unknown) {
    return await this.eventsService.createInscription(body);
  }
}

@Controller('api/unsubscriptions')
export class UnsubscriptionsController {
  constructor(@Inject(EventsService) private readonly eventsService: EventsService) {}

  @Public()
  @Post()
  async createUnsubscription(@Body() body: unknown) {
    return await this.eventsService.createUnsubscription(body);
  }
}


