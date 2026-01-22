import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '@robinswood/auth';
// import { PermissionsGuard } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
// import { RequirePermission } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
import { User } from '@robinswood/auth';

/**
 * Controller Tracking - Routes tracking
 */
@Controller('api/tracking')
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('dashboard')
  // @RequirePermission // TODO: Restore('admin.view')
  async getTrackingDashboard() {
    return await this.trackingService.getTrackingDashboard();
  }

  @Get('metrics')
  // @RequirePermission // TODO: Restore('admin.view')
  async getTrackingMetrics(
    @Query('entityType') entityType?: 'member' | 'patron',
    @Query('entityId') entityId?: string,
    @Query('entityEmail') entityEmail?: string,
    @Query('metricType') metricType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const options: any = {};
    if (entityType) options.entityType = entityType;
    if (entityId) options.entityId = entityId;
    if (entityEmail) options.entityEmail = entityEmail;
    if (metricType) options.metricType = metricType;
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    if (limit) options.limit = parseInt(limit, 10);
    return await this.trackingService.getTrackingMetrics(options);
  }

  @Post('metrics')
  // @RequirePermission // TODO: Restore('admin.manage')
  async createTrackingMetric(
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.trackingService.createTrackingMetric(body, user.email);
  }

  @Get('alerts')
  // @RequirePermission // TODO: Restore('admin.view')
  async getTrackingAlerts(
    @Query('entityType') entityType?: 'member' | 'patron',
    @Query('entityId') entityId?: string,
    @Query('isRead') isRead?: string,
    @Query('isResolved') isResolved?: string,
    @Query('severity') severity?: string,
    @Query('limit') limit?: string,
  ) {
    const options: any = {};
    if (entityType) options.entityType = entityType;
    if (entityId) options.entityId = entityId;
    if (isRead !== undefined) options.isRead = isRead === 'true';
    if (isResolved !== undefined) options.isResolved = isResolved === 'true';
    if (severity) options.severity = severity;
    if (limit) options.limit = parseInt(limit, 10);
    return await this.trackingService.getTrackingAlerts(options);
  }

  @Post('alerts')
  // @RequirePermission // TODO: Restore('admin.manage')
  async createTrackingAlert(
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.trackingService.createTrackingAlert(body, user.email);
  }

  @Put('alerts/:id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async updateTrackingAlert(
    @Param('id') id: string,
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.trackingService.updateTrackingAlert(id, body, user.email);
  }

  @Post('alerts/generate')
  // @RequirePermission // TODO: Restore('admin.manage')
  async generateTrackingAlerts() {
    return await this.trackingService.generateTrackingAlerts();
  }
}

