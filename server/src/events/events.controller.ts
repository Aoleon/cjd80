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
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.eventsService.getEvents(pageNum, limitNum);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createEvent(@Body() body: unknown, @User() user: any) {
    return await this.eventsService.createEvent(body, user);
  }

  @Post('with-inscriptions')
  @UseGuards(JwtAuthGuard)
  async createEventWithInscriptions(@Body() body: unknown, @User() user: any) {
    return await this.eventsService.createEventWithInscriptions(body, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateEvent(@Param('id') id: string, @Body() body: unknown) {
    return await this.eventsService.updateEvent(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id') id: string) {
    await this.eventsService.deleteEvent(id);
  }

  @Get(':id/inscriptions')
  @UseGuards(JwtAuthGuard)
  async getEventInscriptions(@Param('id') id: string) {
    return await this.eventsService.getEventInscriptions(id);
  }
}

@Controller('api/inscriptions')
export class InscriptionsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Throttle({ default: { limit: 20, ttl: 900000 } })
  async createInscription(@Body() body: unknown) {
    return await this.eventsService.createInscription(body);
  }
}

@Controller('api/unsubscriptions')
export class UnsubscriptionsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createUnsubscription(@Body() body: unknown) {
    return await this.eventsService.createUnsubscription(body);
  }
}


