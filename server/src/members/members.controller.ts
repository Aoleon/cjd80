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
import { JwtAuthGuard } from '@robinswood/auth';
// import { PermissionsGuard } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
// import { RequirePermission } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
import { User } from '@robinswood/auth';

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
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class AdminMembersController {
  constructor(private readonly membersService: MembersService) {}

  // ===== Routes admin - Membres =====

  @Get()
  // @RequirePermission // TODO: Restore('admin.view')
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
  // @RequirePermission // TODO: Restore('admin.view')
  async getMemberByEmail(@Param('email') email: string) {
    return await this.membersService.getMemberByEmail(email);
  }

  @Get(':email/activities')
  // @RequirePermission // TODO: Restore('admin.view')
  async getMemberActivities(@Param('email') email: string) {
    return await this.membersService.getMemberActivities(email);
  }

  @Get(':email/details')
  // @RequirePermission // TODO: Restore('admin.view')
  async getMemberDetails(@Param('email') email: string) {
    return await this.membersService.getMemberDetails(email);
  }

  @Patch(':email')
  // @RequirePermission // TODO: Restore('admin.view')
  async updateMember(
    @Param('email') email: string,
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.membersService.updateMember(email, body, user.email);
  }

  @Delete(':email')
  // @RequirePermission // TODO: Restore('admin.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMember(@Param('email') email: string) {
    await this.membersService.deleteMember(email);
  }

  // ===== Routes admin - Subscriptions =====

  @Get(':email/subscriptions')
  // @RequirePermission // TODO: Restore('admin.view')
  async getMemberSubscriptions(@Param('email') email: string) {
    return await this.membersService.getMemberSubscriptions(email);
  }

  @Post(':email/subscriptions')
  // @RequirePermission // TODO: Restore('admin.view')
  async createMemberSubscription(
    @Param('email') email: string,
    @Body() body: unknown,
  ) {
    return await this.membersService.createMemberSubscription(email, body);
  }

  // ===== Routes admin - Tags =====

  @Get(':email/tags')
  // @RequirePermission // TODO: Restore('admin.view')
  async getMemberTags(@Param('email') email: string) {
    return await this.membersService.getMemberTags(email);
  }

  @Post(':email/tags')
  // @RequirePermission // TODO: Restore('admin.view')
  async assignTagToMember(
    @Param('email') email: string,
    @Body() body: unknown,
    @User() user: { email?: string },
  ) {
    return await this.membersService.assignTagToMember(email, body, user.email);
  }

  @Delete(':email/tags/:tagId')
  // @RequirePermission // TODO: Restore('admin.view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTagFromMember(
    @Param('email') email: string,
    @Param('tagId') tagId: string,
  ) {
    await this.membersService.removeTagFromMember(email, tagId);
  }

  // ===== Routes admin - Tasks =====

  @Get(':email/tasks')
  // @RequirePermission // TODO: Restore('admin.view')
  async getMemberTasks(@Param('email') email: string) {
    return await this.membersService.getMemberTasks(email);
  }

  @Post(':email/tasks')
  // @RequirePermission // TODO: Restore('admin.view')
  async createMemberTask(
    @Param('email') email: string,
    @Body() body: unknown,
    @User() user: { email?: string },
  ) {
    return await this.membersService.createMemberTask(email, body, user.email);
  }

  // ===== Routes admin - Relations =====

  @Get(':email/relations')
  // @RequirePermission // TODO: Restore('admin.view')
  async getMemberRelations(@Param('email') email: string) {
    return await this.membersService.getMemberRelations(email);
  }

  @Post(':email/relations')
  // @RequirePermission // TODO: Restore('admin.view')
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
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class AdminMemberTagsController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  // @RequirePermission // TODO: Restore('admin.view')
  async getAllTags() {
    return await this.membersService.getAllTags();
  }

  @Post()
  // @RequirePermission // TODO: Restore('admin.view')
  async createTag(@Body() body: unknown) {
    return await this.membersService.createTag(body);
  }

  @Patch(':id')
  // @RequirePermission // TODO: Restore('admin.view')
  async updateTag(@Param('id') id: string, @Body() body: unknown) {
    return await this.membersService.updateTag(id, body);
  }

  @Delete(':id')
  // @RequirePermission // TODO: Restore('admin.view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTag(@Param('id') id: string) {
    await this.membersService.deleteTag(id);
  }
}

/**
 * Controller Admin Member Tasks - Routes admin pour la gestion des tâches
 */
@Controller('api/admin/member-tasks')
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class AdminMemberTasksController {
  constructor(private readonly membersService: MembersService) {}

  @Patch(':id')
  // @RequirePermission // TODO: Restore('admin.view')
  async updateTask(
    @Param('id') id: string,
    @Body() body: unknown,
    @User() user: { email?: string },
  ) {
    return await this.membersService.updateTask(id, body, user.email);
  }

  @Delete(':id')
  // @RequirePermission // TODO: Restore('admin.view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') id: string) {
    await this.membersService.deleteTask(id);
  }
}

/**
 * Controller Admin Member Relations - Routes admin pour la gestion des relations
 */
@Controller('api/admin/member-relations')
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class AdminMemberRelationsController {
  constructor(private readonly membersService: MembersService) {}

  @Delete(':id')
  // @RequirePermission // TODO: Restore('admin.view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRelation(@Param('id') id: string) {
    await this.membersService.deleteRelation(id);
  }
}

