import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Controller Loans - Routes prêts publiques
 */
@Controller('api/loan-items')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  async getLoanItems(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.loansService.getLoanItems(pageNum, limitNum, search);
  }

  @Post()
  @UseGuards(ThrottlerGuard)
  async createLoanItem(@Body() body: unknown) {
    return await this.loansService.createLoanItem(body);
  }
}

/**
 * Controller Admin Loans - Routes admin pour la gestion des prêts
 */
@Controller('api/admin/loan-items')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminLoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  @Permissions('admin.view')
  async getAllLoanItems(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return await this.loansService.getAllLoanItems(pageNum, limitNum, search);
  }

  @Get(':id')
  @Permissions('admin.view')
  async getLoanItem(@Param('id') id: string) {
    return await this.loansService.getLoanItem(id);
  }

  @Put(':id')
  @Permissions('admin.edit')
  async updateLoanItem(@Param('id') id: string, @Body() body: unknown) {
    return await this.loansService.updateLoanItem(id, body);
  }

  @Patch(':id/status')
  @Permissions('admin.edit')
  async updateLoanItemStatus(
    @Param('id') id: string,
    @Body() body: { status: unknown },
    @User() user: { email?: string },
  ) {
    await this.loansService.updateLoanItemStatus(id, body.status, user.email);
    return { success: true };
  }

  @Delete(':id')
  @Permissions('admin.edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLoanItem(@Param('id') id: string) {
    await this.loansService.deleteLoanItem(id);
  }

  @Post(':id/photo')
  @Permissions('admin.edit')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const ext = file.originalname.split('.').pop()?.toLowerCase();

        if (!allowedMimes.includes(file.mimetype)) {
          return cb(new BadRequestException('Format de fichier non autorisé. Formats acceptés: JPG, PNG, WebP'), false);
        }

        if (!ext || !allowedExtensions.includes(ext)) {
          return cb(new BadRequestException('Extension de fichier non autorisée. Extensions acceptées: .jpg, .jpeg, .png, .webp'), false);
        }

        cb(null, true);
      },
    }),
  )
  async uploadLoanItemPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return await this.loansService.uploadLoanItemPhoto(id, file);
  }
}

