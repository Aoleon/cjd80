import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Req, BadRequestException, UsePipes } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@robinswood/auth';
// import { PermissionsGuard } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
// import { RequirePermission } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
import { User } from '@robinswood/auth';
import { ZodValidationPipe } from '../common/pipes/validation.pipe';
import { logger } from '../../lib/logger';
import { frontendErrorSchema } from '@shared/schema';
import { z } from 'zod';
import {
  updateIdeaStatusDto,
  updateEventStatusDto,
  createInscriptionDto,
  bulkCreateInscriptionsDto,
  createAdministratorDto,
  updateAdministratorRoleDto,
  updateAdministratorStatusDto,
  updateAdministratorInfoDto,
  approveAdministratorDto,
  createDevelopmentRequestDto,
  updateDevelopmentRequestDto,
  updateDevelopmentRequestStatusDto,
  createVoteDto,
  updateUnsubscriptionDto,
  updateFeatureConfigDto,
  updateEmailConfigDto,
  type UpdateIdeaStatusDto,
  type UpdateEventStatusDto,
  type CreateInscriptionDto,
  type BulkCreateInscriptionsDto,
  type CreateAdministratorDto,
  type UpdateAdministratorRoleDto,
  type UpdateAdministratorStatusDto,
  type UpdateAdministratorInfoDto,
  type ApproveAdministratorDto,
  type CreateDevelopmentRequestDto,
  type UpdateDevelopmentRequestDto,
  type UpdateDevelopmentRequestStatusDto,
  type CreateVoteDto,
  type UpdateUnsubscriptionDto,
  type UpdateFeatureConfigDto,
  type UpdateEmailConfigDto,
} from './admin.dto';

/**
 * Controller Admin - Routes d'administration
 */
@Controller('api/admin')
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===== Routes Admin Ideas =====

  @Get('ideas')
  // @RequirePermission // TODO: Restore('admin.view')
  async getAllIdeas(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.adminService.getAllIdeas(pageNum, limitNum);
  }

  @Patch('ideas/:id/status')
  // @RequirePermission // TODO: Restore('admin.edit')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateIdeaStatusDto))
  async updateIdeaStatus(
    @Param('id') id: string,
    @Body() body: UpdateIdeaStatusDto,
  ) {
    logger.info('[AdminController] Updating idea status', { ideaId: id, newStatus: body.status });
    await this.adminService.updateIdeaStatus(id, body.status);
    logger.info('[AdminController] Idea status updated successfully', { ideaId: id });
    return { success: true, message: 'Statut mis à jour' };
  }

  @Patch('ideas/:id/featured')
  // @RequirePermission // TODO: Restore('admin.edit')
  async toggleIdeaFeatured(@Param('id') id: string) {
    return await this.adminService.toggleIdeaFeatured(id);
  }

  @Post('ideas/:id/transform-to-event')
  // @RequirePermission // TODO: Restore('admin.edit')
  async transformIdeaToEvent(@Param('id') id: string) {
    return await this.adminService.transformIdeaToEvent(id);
  }

  @Put('ideas/:id')
  // @RequirePermission // TODO: Restore('admin.edit')
  async updateIdea(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return await this.adminService.updateIdea(id, body);
  }

  @Get('ideas/:ideaId/votes')
  // @RequirePermission // TODO: Restore('admin.view')
  async getIdeaVotes(@Param('ideaId') ideaId: string) {
    return await this.adminService.getVotesByIdea(ideaId);
  }

  // ===== Routes Admin Events =====

  @Get('events')
  // @RequirePermission // TODO: Restore('admin.view')
  async getAllEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.adminService.getAllEvents(pageNum, limitNum);
  }

  @Get('events/:eventId/inscriptions')
  // @RequirePermission // TODO: Restore('admin.view')
  async getEventInscriptions(@Param('eventId') eventId: string) {
    return await this.adminService.getEventInscriptions(eventId);
  }

  @Put('events/:id')
  // @RequirePermission // TODO: Restore('admin.edit')
  async updateEvent(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return await this.adminService.updateEvent(id, body);
  }

  @Patch('events/:id/status')
  // @RequirePermission // TODO: Restore('admin.edit')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateEventStatusDto))
  async updateEventStatus(
    @Param('id') id: string,
    @Body() body: UpdateEventStatusDto,
  ) {
    await this.adminService.updateEventStatus(id, body.status);
  }

  // ===== Routes Admin Inscriptions =====

  @Get('inscriptions/:eventId')
  // @RequirePermission // TODO: Restore('admin.view')
  async getInscriptionsByEvent(@Param('eventId') eventId: string) {
    return await this.adminService.getEventInscriptions(eventId);
  }

  @Post('inscriptions')
  // @RequirePermission // TODO: Restore('admin.edit')
  @UsePipes(new ZodValidationPipe(createInscriptionDto))
  async createInscription(@Body() body: CreateInscriptionDto) {
    return await this.adminService.createInscription(body);
  }

  @Delete('inscriptions/:inscriptionId')
  // @RequirePermission // TODO: Restore('admin.edit')
  async deleteInscription(@Param('inscriptionId') inscriptionId: string) {
    return await this.adminService.deleteInscription(inscriptionId);
  }

  @Post('inscriptions/bulk')
  // @RequirePermission // TODO: Restore('admin.edit')
  @UsePipes(new ZodValidationPipe(bulkCreateInscriptionsDto))
  async bulkCreateInscriptions(
    @Body() body: BulkCreateInscriptionsDto,
  ) {
    return await this.adminService.bulkCreateInscriptions(body.eventId, body.inscriptions);
  }

  // ===== Routes Admin Votes =====

  @Get('votes/:ideaId')
  // @RequirePermission // TODO: Restore('admin.view')
  async getVotes(@Param('ideaId') ideaId: string) {
    return await this.adminService.getVotesByIdea(ideaId);
  }

  @Post('votes')
  // @RequirePermission // TODO: Restore('admin.edit')
  @UsePipes(new ZodValidationPipe(createVoteDto))
  async createVote(@Body() body: CreateVoteDto) {
    return await this.adminService.createVote(body);
  }

  @Delete('votes/:voteId')
  // @RequirePermission // TODO: Restore('admin.edit')
  async deleteVote(@Param('voteId') voteId: string) {
    return await this.adminService.deleteVote(voteId);
  }

  // ===== Routes Admin Administrators =====

  @Get('administrators')
  // @RequirePermission // TODO: Restore('admin.manage')
  async getAllAdministrators() {
    return await this.adminService.getAllAdministrators();
  }

  @Get('pending-admins')
  // @RequirePermission // TODO: Restore('admin.manage')
  async getPendingAdministrators() {
    return await this.adminService.getPendingAdministrators();
  }

  @Post('administrators')
  // @RequirePermission // TODO: Restore('admin.manage')
  @UsePipes(new ZodValidationPipe(createAdministratorDto))
  async createAdministrator(
    @Body() body: CreateAdministratorDto,
    @User() user: { email: string },
  ) {
    return await this.adminService.createAdministrator(body, user.email);
  }

  @Patch('administrators/:email/role')
  // @RequirePermission // TODO: Restore('admin.manage')
  @UsePipes(new ZodValidationPipe(updateAdministratorRoleDto))
  async updateAdministratorRole(
    @Param('email') email: string,
    @Body() body: UpdateAdministratorRoleDto,
    @User() user: { email: string },
  ) {
    return await this.adminService.updateAdministratorRole(email, body.role, user.email);
  }

  @Patch('administrators/:email/status')
  // @RequirePermission // TODO: Restore('admin.manage')
  @UsePipes(new ZodValidationPipe(updateAdministratorStatusDto))
  async updateAdministratorStatus(
    @Param('email') email: string,
    @Body() body: UpdateAdministratorStatusDto,
    @User() user: { email: string },
  ) {
    return await this.adminService.updateAdministratorStatus(email, body.isActive, user.email);
  }

  @Patch('administrators/:email/info')
  // @RequirePermission // TODO: Restore('admin.manage')
  @UsePipes(new ZodValidationPipe(updateAdministratorInfoDto))
  async updateAdministratorInfo(
    @Param('email') email: string,
    @Body() body: UpdateAdministratorInfoDto,
    @User() user: { email: string },
  ) {
    return await this.adminService.updateAdministratorInfo(email, body, user.email);
  }

  @Patch('administrators/:email/password')
  // @RequirePermission // TODO: Restore('admin.manage')
  @HttpCode(HttpStatus.OK)
  async updateAdministratorPassword(
    @Param('email') email: string,
    @Body() body: { newPassword: string },
  ) {
    return this.adminService.updateAdministratorPassword(email, body.newPassword);
  }

  @Delete('administrators/:email')
  // @RequirePermission // TODO: Restore('admin.manage')
  async deleteAdministrator(
    @Param('email') email: string,
    @User() user: { email: string },
  ) {
    return await this.adminService.deleteAdministrator(email, user.email);
  }

  @Patch('administrators/:email/approve')
  // @RequirePermission // TODO: Restore('admin.manage')
  @UsePipes(new ZodValidationPipe(approveAdministratorDto))
  async approveAdministrator(
    @Param('email') email: string,
    @Body() body: ApproveAdministratorDto,
  ) {
    return await this.adminService.approveAdministrator(email, body.role);
  }

  @Delete('administrators/:email/reject')
  // @RequirePermission // TODO: Restore('admin.manage')
  async rejectAdministrator(@Param('email') email: string) {
    return await this.adminService.rejectAdministrator(email);
  }

  // ===== Routes Admin Dashboard/Stats =====

  @Get('stats')
  // @RequirePermission // TODO: Restore('admin.view')
  async getAdminStats() {
    return await this.adminService.getAdminStats();
  }

  @Get('db-health')
  // @RequirePermission // TODO: Restore('admin.view')
  async getDatabaseHealth() {
    return await this.adminService.getDatabaseHealth();
  }

  @Get('pool-stats')
  // @RequirePermission // TODO: Restore('admin.view')
  async getPoolStats() {
    return await this.adminService.getPoolStats();
  }

  // ===== Routes Admin Unsubscriptions =====

  @Get('events/:id/unsubscriptions')
  // @RequirePermission // TODO: Restore('admin.view')
  async getEventUnsubscriptions(@Param('id') id: string) {
    return await this.adminService.getEventUnsubscriptions(id);
  }

  @Delete('unsubscriptions/:id')
  // @RequirePermission // TODO: Restore('admin.edit')
  async deleteUnsubscription(@Param('id') id: string) {
    return await this.adminService.deleteUnsubscription(id);
  }

  @Put('unsubscriptions/:id')
  // @RequirePermission // TODO: Restore('admin.edit')
  @UsePipes(new ZodValidationPipe(updateUnsubscriptionDto))
  async updateUnsubscription(
    @Param('id') id: string,
    @Body() body: UpdateUnsubscriptionDto,
  ) {
    return await this.adminService.updateUnsubscription(id, body);
  }

  // ===== Routes Admin Development Requests =====

  @Get('development-requests')
  // @RequirePermission // TODO: Restore('admin.manage')
  async getDevelopmentRequests() {
    return await this.adminService.getDevelopmentRequests();
  }

  @Post('development-requests')
  // @RequirePermission // TODO: Restore('admin.edit')
  @UsePipes(new ZodValidationPipe(createDevelopmentRequestDto))
  async createDevelopmentRequest(
    @Body() body: CreateDevelopmentRequestDto,
    @User() user: { email: string; firstName?: string; lastName?: string },
  ) {
    return await this.adminService.createDevelopmentRequest(body, user);
  }

  @Put('development-requests/:id')
  // @RequirePermission // TODO: Restore('admin.manage')
  @UsePipes(new ZodValidationPipe(updateDevelopmentRequestDto))
  async updateDevelopmentRequest(
    @Param('id') id: string,
    @Body() body: UpdateDevelopmentRequestDto,
  ) {
    return await this.adminService.updateDevelopmentRequest(id, body);
  }

  @Post('development-requests/:id/sync')
  // @RequirePermission // TODO: Restore('admin.manage')
  async syncDevelopmentRequestWithGitHub(@Param('id') id: string) {
    return await this.adminService.syncDevelopmentRequestWithGitHub(id);
  }

  @Patch('development-requests/:id/status')
  // @RequirePermission // TODO: Restore('admin.manage')
  @UsePipes(new ZodValidationPipe(updateDevelopmentRequestStatusDto))
  async updateDevelopmentRequestStatus(
    @Param('id') id: string,
    @Body() body: UpdateDevelopmentRequestStatusDto,
    @User() user: { email: string },
  ) {
    return await this.adminService.updateDevelopmentRequestStatus(id, body, user);
  }

  @Delete('development-requests/:id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async deleteDevelopmentRequest(@Param('id') id: string) {
    return await this.adminService.deleteDevelopmentRequest(id);
  }

  // ===== Routes Admin Logs & Tests =====

  @Get('errors')
  // @RequirePermission // TODO: Restore('admin.view')
  async getErrorLogs(@Query('limit') limit?: string) {
    const limitNum = parseInt(limit || '100', 10);
    return await this.adminService.getErrorLogs(limitNum);
  }

  @Get('test-email')
  // @RequirePermission // TODO: Restore('admin.manage')
  async testEmailConfiguration() {
    return await this.adminService.testEmailConfiguration();
  }

  @Get('test-email-simple')
  // @RequirePermission // TODO: Restore('admin.manage')
  async testEmailSimple() {
    return await this.adminService.testEmailSimple();
  }

  // ===== Routes Admin Feature Configuration =====

  @Get('features')
  async getFeatureConfig() {
    return await this.adminService.getFeatureConfig();
  }

  @Put('features/:featureKey')
  // @RequirePermission // TODO: Restore('admin.manage')
  @UsePipes(new ZodValidationPipe(updateFeatureConfigDto))
  async updateFeatureConfig(
    @Param('featureKey') featureKey: string,
    @Body() body: UpdateFeatureConfigDto,
    @User() user: { email: string },
  ) {
    return await this.adminService.updateFeatureConfig(featureKey, body.enabled, user.email);
  }

  // ===== Routes Admin Email Configuration =====

  @Get('email-config')
  // @RequirePermission // TODO: Restore('admin.view')
  async getEmailConfig() {
    return await this.adminService.getEmailConfig();
  }

  @Put('email-config')
  // @RequirePermission // TODO: Restore('admin.manage')
  @UsePipes(new ZodValidationPipe(updateEmailConfigDto))
  async updateEmailConfig(
    @Body() body: UpdateEmailConfigDto,
    @User() user: { email: string },
  ) {
    return await this.adminService.updateEmailConfig(body, user.email);
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
