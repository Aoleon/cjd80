import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

/**
 * Controller Admin - Routes d'administration
 */
@Controller('api/admin')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===== Routes Admin Ideas =====

  @Get('ideas')
  @Permissions('admin.view')
  async getAllIdeas(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.adminService.getAllIdeas(pageNum, limitNum);
  }

  @Patch('ideas/:id/status')
  @Permissions('admin.edit')
  @HttpCode(HttpStatus.OK)
  async updateIdeaStatus(
    @Param('id') id: string,
    @Body() body: { status: unknown },
  ) {
    await this.adminService.updateIdeaStatus(id, body.status);
  }

  @Patch('ideas/:id/featured')
  @Permissions('admin.edit')
  async toggleIdeaFeatured(@Param('id') id: string) {
    return await this.adminService.toggleIdeaFeatured(id);
  }

  @Post('ideas/:id/transform-to-event')
  @Permissions('admin.edit')
  async transformIdeaToEvent(@Param('id') id: string) {
    return await this.adminService.transformIdeaToEvent(id);
  }

  @Put('ideas/:id')
  @Permissions('admin.edit')
  async updateIdea(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return await this.adminService.updateIdea(id, body);
  }

  @Get('ideas/:ideaId/votes')
  @Permissions('admin.view')
  async getIdeaVotes(@Param('ideaId') ideaId: string) {
    return await this.adminService.getVotesByIdea(ideaId);
  }

  // ===== Routes Admin Events =====

  @Get('events')
  @Permissions('admin.view')
  async getAllEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.adminService.getAllEvents(pageNum, limitNum);
  }

  @Get('events/:eventId/inscriptions')
  @Permissions('admin.view')
  async getEventInscriptions(@Param('eventId') eventId: string) {
    return await this.adminService.getEventInscriptions(eventId);
  }

  @Put('events/:id')
  @Permissions('admin.edit')
  async updateEvent(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return await this.adminService.updateEvent(id, body);
  }

  @Patch('events/:id/status')
  @Permissions('admin.edit')
  @HttpCode(HttpStatus.OK)
  async updateEventStatus(
    @Param('id') id: string,
    @Body() body: { status: unknown },
  ) {
    await this.adminService.updateEventStatus(id, body.status);
  }

  // ===== Routes Admin Inscriptions =====

  @Get('inscriptions/:eventId')
  @Permissions('admin.view')
  async getInscriptionsByEvent(@Param('eventId') eventId: string) {
    return await this.adminService.getEventInscriptions(eventId);
  }

  @Post('inscriptions')
  @Permissions('admin.edit')
  async createInscription(@Body() body: unknown) {
    return await this.adminService.createInscription(body);
  }

  @Delete('inscriptions/:inscriptionId')
  @Permissions('admin.edit')
  async deleteInscription(@Param('inscriptionId') inscriptionId: string) {
    return await this.adminService.deleteInscription(inscriptionId);
  }

  @Post('inscriptions/bulk')
  @Permissions('admin.edit')
  async bulkCreateInscriptions(
    @Body() body: { eventId: string; inscriptions: Array<{ name: string; email: string; comments?: string }> },
  ) {
    return await this.adminService.bulkCreateInscriptions(body.eventId, body.inscriptions);
  }

  // ===== Routes Admin Votes =====

  @Get('votes/:ideaId')
  @Permissions('admin.view')
  async getVotes(@Param('ideaId') ideaId: string) {
    return await this.adminService.getVotesByIdea(ideaId);
  }

  @Post('votes')
  @Permissions('admin.edit')
  async createVote(@Body() body: unknown) {
    return await this.adminService.createVote(body);
  }

  @Delete('votes/:voteId')
  @Permissions('admin.edit')
  async deleteVote(@Param('voteId') voteId: string) {
    return await this.adminService.deleteVote(voteId);
  }

  // ===== Routes Admin Administrators =====

  @Get('administrators')
  @Permissions('admin.manage')
  async getAllAdministrators() {
    return await this.adminService.getAllAdministrators();
  }

  @Get('pending-admins')
  @Permissions('admin.manage')
  async getPendingAdministrators() {
    return await this.adminService.getPendingAdministrators();
  }

  @Post('administrators')
  @Permissions('admin.manage')
  async createAdministrator(
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.adminService.createAdministrator(body, user.email);
  }

  @Patch('administrators/:email/role')
  @Permissions('admin.manage')
  async updateAdministratorRole(
    @Param('email') email: string,
    @Body() body: { role: unknown },
    @User() user: { email: string },
  ) {
    return await this.adminService.updateAdministratorRole(email, body.role, user.email);
  }

  @Patch('administrators/:email/status')
  @Permissions('admin.manage')
  async updateAdministratorStatus(
    @Param('email') email: string,
    @Body() body: { isActive: unknown },
    @User() user: { email: string },
  ) {
    return await this.adminService.updateAdministratorStatus(email, body.isActive, user.email);
  }

  @Patch('administrators/:email/info')
  @Permissions('admin.manage')
  async updateAdministratorInfo(
    @Param('email') email: string,
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.adminService.updateAdministratorInfo(email, body, user.email);
  }

  @Patch('administrators/:email/password')
  @Permissions('admin.manage')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  async updateAdministratorPassword() {
    // NOTE: Cette route n'est plus utilisée avec Authentik
    return {
      message: "La modification de mot de passe n'est plus disponible. Les mots de passe sont maintenant gérés par Authentik.",
    };
  }

  @Delete('administrators/:email')
  @Permissions('admin.manage')
  async deleteAdministrator(
    @Param('email') email: string,
    @User() user: { email: string },
  ) {
    return await this.adminService.deleteAdministrator(email, user.email);
  }

  @Patch('administrators/:email/approve')
  @Permissions('admin.manage')
  async approveAdministrator(
    @Param('email') email: string,
    @Body() body: { role: unknown },
  ) {
    return await this.adminService.approveAdministrator(email, body.role);
  }

  @Delete('administrators/:email/reject')
  @Permissions('admin.manage')
  async rejectAdministrator(@Param('email') email: string) {
    return await this.adminService.rejectAdministrator(email);
  }

  // ===== Routes Admin Dashboard/Stats =====

  @Get('stats')
  @Permissions('admin.view')
  async getAdminStats() {
    return await this.adminService.getAdminStats();
  }

  @Get('db-health')
  @Permissions('admin.view')
  async getDatabaseHealth() {
    return await this.adminService.getDatabaseHealth();
  }

  @Get('pool-stats')
  @Permissions('admin.view')
  async getPoolStats() {
    return await this.adminService.getPoolStats();
  }

  // ===== Routes Admin Unsubscriptions =====

  @Get('events/:id/unsubscriptions')
  @Permissions('admin.view')
  async getEventUnsubscriptions(@Param('id') id: string) {
    return await this.adminService.getEventUnsubscriptions(id);
  }

  @Delete('unsubscriptions/:id')
  @Permissions('admin.edit')
  async deleteUnsubscription(@Param('id') id: string) {
    return await this.adminService.deleteUnsubscription(id);
  }

  @Put('unsubscriptions/:id')
  @Permissions('admin.edit')
  async updateUnsubscription(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return await this.adminService.updateUnsubscription(id, body);
  }

  // ===== Routes Admin Development Requests =====

  @Get('development-requests')
  @Permissions('admin.manage')
  async getDevelopmentRequests() {
    return await this.adminService.getDevelopmentRequests();
  }

  @Post('development-requests')
  @Permissions('admin.manage')
  async createDevelopmentRequest(
    @Body() body: unknown,
    @User() user: { email: string; firstName?: string; lastName?: string },
  ) {
    return await this.adminService.createDevelopmentRequest(body, user);
  }

  @Put('development-requests/:id')
  @Permissions('admin.manage')
  async updateDevelopmentRequest(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return await this.adminService.updateDevelopmentRequest(id, body);
  }

  @Post('development-requests/:id/sync')
  @Permissions('admin.manage')
  async syncDevelopmentRequestWithGitHub(@Param('id') id: string) {
    return await this.adminService.syncDevelopmentRequestWithGitHub(id);
  }

  @Patch('development-requests/:id/status')
  @Permissions('admin.manage')
  async updateDevelopmentRequestStatus(
    @Param('id') id: string,
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.adminService.updateDevelopmentRequestStatus(id, body, user);
  }

  @Delete('development-requests/:id')
  @Permissions('admin.manage')
  async deleteDevelopmentRequest(@Param('id') id: string) {
    return await this.adminService.deleteDevelopmentRequest(id);
  }

  // ===== Routes Admin Logs & Tests =====

  @Get('errors')
  @Permissions('admin.view')
  async getErrorLogs(@Query('limit') limit?: string) {
    const limitNum = parseInt(limit || '100', 10);
    return await this.adminService.getErrorLogs(limitNum);
  }

  @Get('test-email')
  @Permissions('admin.manage')
  async testEmailConfiguration() {
    return await this.adminService.testEmailConfiguration();
  }

  @Get('test-email-simple')
  @Permissions('admin.manage')
  async testEmailSimple() {
    return await this.adminService.testEmailSimple();
  }
}

/**
 * Controller Logs - Routes pour les logs frontend
 */
@Controller('api/logs')
export class LogsController {
  @Post('frontend-error')
  async logFrontendError(@Body() body: unknown, @Req() req: any) {
    try {
      const validatedData = frontendErrorSchema.parse(body);

      const sanitizedStack = validatedData.stack?.substring(0, 5000) || 'N/A';
      const sanitizedComponentStack = validatedData.componentStack?.substring(0, 3000) || 'N/A';

      logger.error('Frontend error', {
        message: validatedData.message,
        stack: sanitizedStack,
        componentStack: sanitizedComponentStack,
        url: validatedData.url,
        userAgent: validatedData.userAgent,
        timestamp: validatedData.timestamp,
        userEmail: req.user?.email || 'anonymous',
      });

      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Invalid frontend error log attempt', { error: error.toString() });
        throw new BadRequestException('Invalid error format');
      }
      logger.error('Failed to log frontend error', { error });
      throw error;
    }
  }
}

