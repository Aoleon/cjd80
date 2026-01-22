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
import { PatronsService } from './patrons.service';
import { JwtAuthGuard } from '@robinswood/auth';
// import { PermissionsGuard } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
// import { RequirePermission } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
import { User } from '@robinswood/auth';

/**
 * Controller Patrons - Routes mécènes publiques
 */
@Controller('api/patrons')
export class PatronsController {
  constructor(private readonly patronsService: PatronsService) {}

  @Post('propose')
  @UseGuards(JwtAuthGuard)
  async proposePatron(
    @Body() body: unknown,
    @User() user: { email?: string },
  ) {
    return await this.patronsService.proposePatron(body, user?.email);
  }
}

/**
 * Controller Admin Patrons - Routes admin pour la gestion des mécènes
 */
@Controller('api/patrons')
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class AdminPatronsController {
  constructor(private readonly patronsService: PatronsService) {}

  @Get()
  // @RequirePermission // TODO: Restore('admin.manage')
  async getPatrons(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.patronsService.getPatrons(pageNum, limitNum, status, search);
  }

  @Get('search/email')
  // @RequirePermission // TODO: Restore('admin.manage')
  async searchPatronByEmail(@Query('email') email: string) {
    return await this.patronsService.searchPatronByEmail(email);
  }

  @Get(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async getPatronById(@Param('id') id: string) {
    return await this.patronsService.getPatronById(id);
  }

  @Post()
  // @RequirePermission // TODO: Restore('admin.manage')
  async createPatron(
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.patronsService.createPatron(body, user.email);
  }

  @Patch(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async updatePatron(
    @Param('id') id: string,
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.patronsService.updatePatron(id, body, user.email);
  }

  @Delete(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePatron(@Param('id') id: string) {
    await this.patronsService.deletePatron(id);
  }

  // ===== Routes admin - Donations =====

  @Post(':id/donations')
  // @RequirePermission // TODO: Restore('admin.manage')
  async createPatronDonation(
    @Param('id') patronId: string,
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.patronsService.createPatronDonation(patronId, body, user.email);
  }

  @Get(':id/donations')
  // @RequirePermission // TODO: Restore('admin.manage')
  async getPatronDonations(@Param('id') patronId: string) {
    return await this.patronsService.getPatronDonations(patronId);
  }

  // ===== Routes admin - Proposals =====

  @Get(':id/proposals')
  // @RequirePermission // TODO: Restore('admin.manage')
  async getPatronProposals(@Param('id') patronId: string) {
    return await this.patronsService.getPatronProposals(patronId);
  }

  // ===== Routes admin - Updates =====

  @Post(':id/updates')
  // @RequirePermission // TODO: Restore('admin.manage')
  async createPatronUpdate(
    @Param('id') patronId: string,
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.patronsService.createPatronUpdate(patronId, body, user.email);
  }

  @Get(':id/updates')
  // @RequirePermission // TODO: Restore('admin.manage')
  async getPatronUpdates(@Param('id') patronId: string) {
    return await this.patronsService.getPatronUpdates(patronId);
  }

  // ===== Routes admin - Sponsorships =====

  @Post(':patronId/sponsorships')
  // @RequirePermission // TODO: Restore('admin.manage')
  async createPatronSponsorship(
    @Param('patronId') patronId: string,
    @Body() body: unknown,
    @User() user: { email: string },
  ) {
    return await this.patronsService.createPatronSponsorship(patronId, body, user.email);
  }

  @Get(':patronId/sponsorships')
  // @RequirePermission // TODO: Restore('admin.view')
  async getPatronSponsorships(@Param('patronId') patronId: string) {
    return await this.patronsService.getPatronSponsorships(patronId);
  }
}

/**
 * Controller Admin Donations - Routes admin pour la gestion globale des dons
 */
@Controller('api/donations')
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class AdminDonationsController {
  constructor(private readonly patronsService: PatronsService) {}

  @Get()
  // @RequirePermission // TODO: Restore('admin.manage')
  async getAllDonations() {
    return await this.patronsService.getAllDonations();
  }

  @Patch(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async updatePatronDonation(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return await this.patronsService.updatePatronDonation(id, body);
  }

  @Delete(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePatronDonation(@Param('id') id: string) {
    await this.patronsService.deletePatronDonation(id);
  }
}

/**
 * Controller Admin Proposals - Routes admin pour la gestion globale des propositions
 */
@Controller('api/proposals')
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class AdminProposalsController {
  constructor(private readonly patronsService: PatronsService) {}

  @Patch(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async updateIdeaPatronProposal(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return await this.patronsService.updateIdeaPatronProposal(id, body);
  }

  @Delete(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteIdeaPatronProposal(@Param('id') id: string) {
    await this.patronsService.deleteIdeaPatronProposal(id);
  }
}

/**
 * Controller Admin Patron Updates - Routes admin pour la gestion globale des actualités
 */
@Controller('api/patron-updates')
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class AdminPatronUpdatesController {
  constructor(private readonly patronsService: PatronsService) {}

  @Patch(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async updatePatronUpdate(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return await this.patronsService.updatePatronUpdate(id, body);
  }

  @Delete(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePatronUpdate(@Param('id') id: string) {
    await this.patronsService.deletePatronUpdate(id);
  }
}

/**
 * Controller Admin Sponsorships - Routes admin pour la gestion globale des sponsorings
 */
@Controller('api/sponsorships')
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class AdminSponsorshipsController {
  constructor(private readonly patronsService: PatronsService) {}

  @Get()
  // @RequirePermission // TODO: Restore('admin.view')
  async getAllSponsorships() {
    return await this.patronsService.getAllSponsorships();
  }

  @Get('stats')
  // @RequirePermission // TODO: Restore('admin.view')
  async getSponsorshipStats() {
    return await this.patronsService.getSponsorshipStats();
  }

  @Patch(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async updateEventSponsorship(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return await this.patronsService.updateEventSponsorship(id, body);
  }

  @Delete(':id')
  // @RequirePermission // TODO: Restore('admin.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEventSponsorship(@Param('id') id: string) {
    await this.patronsService.deleteEventSponsorship(id);
  }
}

