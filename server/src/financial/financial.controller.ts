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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

/**
 * Controller Financial - Routes financières
 */
@ApiTags('financial')
@ApiBearerAuth()
@Controller('api/admin/finance')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // ===== Routes Budgets =====

  @Get('budgets/stats')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Obtenir les statistiques des budgets' })
  @ApiQuery({ name: 'period', required: false, description: 'Période', example: 'Q1' })
  @ApiQuery({ name: 'year', required: false, description: 'Année', example: '2026' })
  @ApiResponse({ status: 200, description: 'Statistiques des budgets' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async getBudgetStats(
    @Query('period') period?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return await this.financialService.getBudgetStats(period, yearNum);
  }

  @Get('budgets')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Obtenir la liste des budgets avec filtres' })
  @ApiQuery({ name: 'period', required: false, description: 'Période (Q1, Q2, Q3, Q4, annual)', example: 'Q1' })
  @ApiQuery({ name: 'year', required: false, description: 'Année', example: '2026' })
  @ApiQuery({ name: 'category', required: false, description: 'Catégorie de budget', example: 'events' })
  @ApiResponse({ status: 200, description: 'Liste des budgets' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async getBudgets(
    @Query('period') period?: string,
    @Query('year') year?: string,
    @Query('category') category?: string,
  ) {
    const options: Record<string, string | number> = {};
    if (period) options.period = period;
    if (year) options.year = parseInt(year, 10);
    if (category) options.category = category;
    return await this.financialService.getBudgets(options);
  }

  @Get('budgets/:id')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Obtenir un budget par ID' })
  @ApiParam({ name: 'id', description: 'ID du budget', example: 'uuid-budget-123' })
  @ApiResponse({ status: 200, description: 'Détails du budget' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Budget non trouvé' })
  async getBudgetById(@Param('id') id: string) {
    return await this.financialService.getBudgetById(id);
  }

  @Post('budgets')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Créer un nouveau budget' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Budget Événements Q1' },
        category: { type: 'string', example: 'events' },
        amountInCents: { type: 'number', example: 1000000, description: 'Montant en centimes' },
        period: { type: 'string', example: 'Q1' },
        year: { type: 'number', example: 2026 }
      },
      required: ['name', 'category', 'amountInCents', 'period', 'year']
    }
  })
  @ApiResponse({ status: 201, description: 'Budget créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async createBudget(@Body() body: unknown) {
    return await this.financialService.createBudget(body);
  }

  @Put('budgets/:id')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Mettre à jour un budget' })
  @ApiParam({ name: 'id', description: 'ID du budget', example: 'uuid-budget-123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Budget Événements Q1 - Mis à jour' },
        amountInCents: { type: 'number', example: 1200000 },
        category: { type: 'string', example: 'events' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Budget mis à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Budget non trouvé' })
  async updateBudget(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateBudget(id, body);
  }

  @Delete('budgets/:id')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Supprimer un budget' })
  @ApiParam({ name: 'id', description: 'ID du budget', example: 'uuid-budget-123' })
  @ApiResponse({ status: 200, description: 'Budget supprimé avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Budget non trouvé' })
  async deleteBudget(@Param('id') id: string) {
    return await this.financialService.deleteBudget(id);
  }

  // ===== Routes Expenses =====

  @Get('expenses/stats')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Obtenir les statistiques des dépenses' })
  @ApiQuery({ name: 'period', required: false, description: 'Période', example: 'Q1' })
  @ApiQuery({ name: 'year', required: false, description: 'Année', example: '2026' })
  @ApiResponse({ status: 200, description: 'Statistiques des dépenses' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async getExpenseStats(
    @Query('period') period?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return await this.financialService.getExpenseStats(period, yearNum);
  }

  @Get('expenses')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Obtenir la liste des dépenses avec filtres' })
  @ApiQuery({ name: 'period', required: false, description: 'Période', example: 'Q1' })
  @ApiQuery({ name: 'year', required: false, description: 'Année', example: '2026' })
  @ApiQuery({ name: 'category', required: false, description: 'Catégorie', example: 'events' })
  @ApiQuery({ name: 'budgetId', required: false, description: 'ID du budget associé', example: 'uuid-budget-123' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Date de début', example: '2026-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Date de fin', example: '2026-03-31' })
  @ApiResponse({ status: 200, description: 'Liste des dépenses' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async getExpenses(
    @Query('period') period?: string,
    @Query('year') year?: string,
    @Query('category') category?: string,
    @Query('budgetId') budgetId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const options: Record<string, string | number> = {};
    if (period) options.period = period;
    if (year) options.year = parseInt(year, 10);
    if (category) options.category = category;
    if (budgetId) options.budgetId = budgetId;
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    return await this.financialService.getExpenses(options);
  }

  @Get('expenses/:id')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Obtenir une dépense par ID' })
  @ApiParam({ name: 'id', description: 'ID de la dépense', example: 'uuid-expense-123' })
  @ApiResponse({ status: 200, description: 'Détails de la dépense' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Dépense non trouvée' })
  async getExpenseById(@Param('id') id: string) {
    return await this.financialService.getExpenseById(id);
  }

  @Post('expenses')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Créer une nouvelle dépense' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', example: 'Location salle conférence' },
        amountInCents: { type: 'number', example: 50000, description: 'Montant en centimes' },
        category: { type: 'string', example: 'events' },
        budgetId: { type: 'string', example: 'uuid-budget-123' },
        date: { type: 'string', format: 'date', example: '2026-01-15' },
        vendor: { type: 'string', example: 'Salle des Fêtes' }
      },
      required: ['description', 'amountInCents', 'category', 'date']
    }
  })
  @ApiResponse({ status: 201, description: 'Dépense créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async createExpense(@Body() body: unknown) {
    return await this.financialService.createExpense(body);
  }

  @Put('expenses/:id')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Mettre à jour une dépense' })
  @ApiParam({ name: 'id', description: 'ID de la dépense', example: 'uuid-expense-123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        amountInCents: { type: 'number' },
        category: { type: 'string' },
        date: { type: 'string', format: 'date' },
        vendor: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Dépense mise à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Dépense non trouvée' })
  async updateExpense(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateExpense(id, body);
  }

  @Delete('expenses/:id')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Supprimer une dépense' })
  @ApiParam({ name: 'id', description: 'ID de la dépense', example: 'uuid-expense-123' })
  @ApiResponse({ status: 200, description: 'Dépense supprimée avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Dépense non trouvée' })
  async deleteExpense(@Param('id') id: string) {
    return await this.financialService.deleteExpense(id);
  }

  // ===== Routes Categories =====

  @Get('categories')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Obtenir les catégories financières' })
  @ApiQuery({ name: 'type', required: false, description: 'Type de catégorie (income/expense)', example: 'expense' })
  @ApiResponse({ status: 200, description: 'Liste des catégories' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async getCategories(@Query('type') type?: string) {
    return await this.financialService.getCategories(type);
  }

  @Post('categories')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Créer une catégorie financière' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Marketing' },
        type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
        description: { type: 'string', example: 'Dépenses marketing et communication' }
      },
      required: ['name', 'type']
    }
  })
  @ApiResponse({ status: 201, description: 'Catégorie créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async createCategory(@Body() body: unknown) {
    return await this.financialService.createCategory(body);
  }

  @Put('categories/:id')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Mettre à jour une catégorie financière' })
  @ApiParam({ name: 'id', description: 'ID de la catégorie', example: 'uuid-category-123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Catégorie mise à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async updateCategory(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateCategory(id, body);
  }

  // ===== Routes Forecasts =====

  @Get('forecasts')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Obtenir les prévisions financières' })
  @ApiQuery({ name: 'period', required: false, description: 'Période', example: 'Q2' })
  @ApiQuery({ name: 'year', required: false, description: 'Année', example: '2026' })
  @ApiQuery({ name: 'category', required: false, description: 'Catégorie', example: 'events' })
  @ApiResponse({ status: 200, description: 'Liste des prévisions' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async getForecasts(
    @Query('period') period?: string,
    @Query('year') year?: string,
    @Query('category') category?: string,
  ) {
    const options: Record<string, string | number> = {};
    if (period) options.period = period;
    if (year) options.year = parseInt(year, 10);
    if (category) options.category = category;
    return await this.financialService.getForecasts(options);
  }

  @Post('forecasts')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Créer une prévision financière' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        category: { type: 'string', example: 'events' },
        period: { type: 'string', example: 'Q2' },
        year: { type: 'number', example: 2026 },
        expectedAmountInCents: { type: 'number', example: 800000 },
        notes: { type: 'string', example: 'Prévision événements printemps' }
      },
      required: ['category', 'period', 'year', 'expectedAmountInCents']
    }
  })
  @ApiResponse({ status: 201, description: 'Prévision créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async createForecast(@Body() body: unknown) {
    return await this.financialService.createForecast(body);
  }

  @Put('forecasts/:id')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Mettre à jour une prévision financière' })
  @ApiParam({ name: 'id', description: 'ID de la prévision', example: 'uuid-forecast-123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        expectedAmountInCents: { type: 'number' },
        notes: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Prévision mise à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  @ApiResponse({ status: 404, description: 'Prévision non trouvée' })
  async updateForecast(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateForecast(id, body);
  }

  @Post('forecasts/generate')
  @Permissions('admin.manage')
  @ApiOperation({ summary: 'Générer automatiquement les prévisions pour une période' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        period: { type: 'string', example: 'Q2', description: 'Période cible' },
        year: { type: 'number', example: 2026, description: 'Année cible' }
      },
      required: ['period', 'year']
    }
  })
  @ApiResponse({ status: 201, description: 'Prévisions générées avec succès' })
  @ApiResponse({ status: 400, description: 'period et year sont requis' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async generateForecasts(@Body() body: { period: string; year: number }) {
    if (!body.period || !body.year) {
      throw new BadRequestException('period et year sont requis');
    }
    return await this.financialService.generateForecasts(body.period, body.year);
  }

  // ===== Routes KPIs & Reports =====

  @Get('kpis/extended')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Obtenir les KPIs financiers étendus' })
  @ApiQuery({ name: 'period', required: false, description: 'Période', example: 'Q1' })
  @ApiQuery({ name: 'year', required: false, description: 'Année', example: '2026' })
  @ApiResponse({ status: 200, description: 'KPIs financiers détaillés' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async getFinancialKPIsExtended(
    @Query('period') period?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return await this.financialService.getFinancialKPIsExtended(period, yearNum);
  }

  @Get('comparison')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Comparer deux périodes financières' })
  @ApiQuery({ name: 'period1', required: true, description: 'Première période', example: 'Q1' })
  @ApiQuery({ name: 'year1', required: true, description: 'Première année', example: '2025' })
  @ApiQuery({ name: 'period2', required: true, description: 'Deuxième période', example: 'Q1' })
  @ApiQuery({ name: 'year2', required: true, description: 'Deuxième année', example: '2026' })
  @ApiResponse({ status: 200, description: 'Comparaison des deux périodes' })
  @ApiResponse({ status: 400, description: 'Tous les paramètres sont requis' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async getFinancialComparison(
    @Query('period1') period1?: string,
    @Query('year1') year1?: string,
    @Query('period2') period2?: string,
    @Query('year2') year2?: string,
  ) {
    if (!period1 || !year1 || !period2 || !year2) {
      throw new BadRequestException('period1, year1, period2, year2 sont requis');
    }
    return await this.financialService.getFinancialComparison(
      period1,
      parseInt(year1, 10),
      period2,
      parseInt(year2, 10),
    );
  }

  @Get('reports/:type')
  @Permissions('admin.view')
  @ApiOperation({ summary: 'Générer un rapport financier' })
  @ApiParam({ name: 'type', description: 'Type de rapport', enum: ['monthly', 'quarterly', 'yearly'] })
  @ApiQuery({ name: 'period', required: true, description: 'Numéro de période (1-12 pour monthly, 1-4 pour quarterly)', example: '1' })
  @ApiQuery({ name: 'year', required: true, description: 'Année', example: '2026' })
  @ApiResponse({ status: 200, description: 'Rapport financier généré' })
  @ApiResponse({ status: 400, description: 'Type invalide ou paramètres manquants' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  async getFinancialReport(
    @Param('type') type: string,
    @Query('period') period?: string,
    @Query('year') year?: string,
  ) {
    if (!['monthly', 'quarterly', 'yearly'].includes(type)) {
      throw new BadRequestException('type doit être monthly, quarterly ou yearly');
    }
    if (!period || !year) {
      throw new BadRequestException('period et year sont requis');
    }
    return await this.financialService.getFinancialReport(
      type as 'monthly' | 'quarterly' | 'yearly',
      parseInt(period, 10),
      parseInt(year, 10),
    );
  }
}

