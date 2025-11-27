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
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

/**
 * Controller Members - Routes membres/CRM
 */
@Controller('api/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // ===== Routes publiques =====

  @Post('propose')
  async proposeMember(@Body() body: unknown) {
    return await this.membersService.proposeMember(body);
  }
}

/**
 * Controller Admin Members - Routes admin pour la gestion des membres
 */
@Controller('api/admin/members')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminMembersController {
  constructor(private readonly membersService: MembersService) {}

  // ===== Routes admin - Membres =====

  @Get()
  @Permissions('admin.view')
  async getMembers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('score') score?: 'high' | 'medium' | 'low',
    @Query('activity') activity?: 'recent' | 'inactive',
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.membersService.getMembers(pageNum, limitNum, status, search, score, activity);
  }

  @Get(':email')
  @Permissions('admin.view')
  async getMemberByEmail(@Param('email') email: string) {
    return await this.membersService.getMemberByEmail(email);
  }

  @Get(':email/activities')
  @Permissions('admin.view')
  async getMemberActivities(@Param('email') email: string) {
    return await this.membersService.getMemberActivities(email);
  }

  @Get(':email/details')
  @Permissions('admin.view')
  async getMemberDetails(@Param('email') email: string) {
    return await this.membersService.getMemberDetails(email);
  }

  @Patch(':email')
  @Permissions('admin.view')
  async updateMember(
    @Param('email') email: string,
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.membersService.updateMember(email, body, user.email);
  }

  @Delete(':email')
  @Permissions('admin.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMember(@Param('email') email: string) {
    await this.membersService.deleteMember(email);
  }

  // ===== Routes admin - Subscriptions =====

  @Get(':email/subscriptions')
  @Permissions('admin.view')
  async getMemberSubscriptions(@Param('email') email: string) {
    return await this.membersService.getMemberSubscriptions(email);
  }

  @Post(':email/subscriptions')
  @Permissions('admin.view')
  async createMemberSubscription(
    @Param('email') email: string,
    @Body() body: unknown,
  ) {
    return await this.membersService.createMemberSubscription(email, body);
  }

  // ===== Routes admin - Tags =====

  @Get(':email/tags')
  @Permissions('admin.view')
  async getMemberTags(@Param('email') email: string) {
    return await this.membersService.getMemberTags(email);
  }

  @Post(':email/tags')
  @Permissions('admin.view')
  async assignTagToMember(
    @Param('email') email: string,
    @Body() body: unknown,
    @User() user: { email?: string },
  ) {
    return await this.membersService.assignTagToMember(email, body, user.email);
  }

  @Delete(':email/tags/:tagId')
  @Permissions('admin.view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTagFromMember(
    @Param('email') email: string,
    @Param('tagId') tagId: string,
  ) {
    await this.membersService.removeTagFromMember(email, tagId);
  }

  // ===== Routes admin - Tasks =====

  @Get(':email/tasks')
  @Permissions('admin.view')
  async getMemberTasks(@Param('email') email: string) {
    return await this.membersService.getMemberTasks(email);
  }

  @Post(':email/tasks')
  @Permissions('admin.view')
  async createMemberTask(
    @Param('email') email: string,
    @Body() body: unknown,
    @User() user: { email?: string },
  ) {
    return await this.membersService.createMemberTask(email, body, user.email);
  }

  // ===== Routes admin - Relations =====

  @Get(':email/relations')
  @Permissions('admin.view')
  async getMemberRelations(@Param('email') email: string) {
    return await this.membersService.getMemberRelations(email);
  }

  @Post(':email/relations')
  @Permissions('admin.view')
  async createMemberRelation(
    @Param('email') email: string,
    @Body() body: unknown,
    @User() user: { email?: string },
  ) {
    return await this.membersService.createMemberRelation(email, body, user.email);
  }
}

/**
 * Controller Admin Member Tags - Routes admin pour la gestion des tags
 */
@Controller('api/admin/member-tags')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminMemberTagsController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Permissions('admin.view')
  async getAllTags() {
    return await this.membersService.getAllTags();
  }

  @Post()
  @Permissions('admin.view')
  async createTag(@Body() body: unknown) {
    return await this.membersService.createTag(body);
  }

  @Patch(':id')
  @Permissions('admin.view')
  async updateTag(@Param('id') id: string, @Body() body: unknown) {
    return await this.membersService.updateTag(id, body);
  }

  @Delete(':id')
  @Permissions('admin.view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTag(@Param('id') id: string) {
    await this.membersService.deleteTag(id);
  }
}

/**
 * Controller Admin Member Tasks - Routes admin pour la gestion des tâches
 */
@Controller('api/admin/member-tasks')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminMemberTasksController {
  constructor(private readonly membersService: MembersService) {}

  @Patch(':id')
  @Permissions('admin.view')
  async updateTask(
    @Param('id') id: string,
    @Body() body: unknown,
    @User() user: { email?: string },
  ) {
    return await this.membersService.updateTask(id, body, user.email);
  }

  @Delete(':id')
  @Permissions('admin.view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') id: string) {
    await this.membersService.deleteTask(id);
  }
}

/**
 * Controller Admin Member Relations - Routes admin pour la gestion des relations
 */
@Controller('api/admin/member-relations')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminMemberRelationsController {
  constructor(private readonly membersService: MembersService) {}

  @Delete(':id')
  @Permissions('admin.view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRelation(@Param('id') id: string) {
    await this.membersService.deleteRelation(id);
  }
}

