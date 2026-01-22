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
import { FinancialService } from './financial.service';
import { JwtAuthGuard } from '@robinswood/auth';
// import { PermissionsGuard } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
// import { RequirePermission } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter

/**
 * Controller Financial - Routes financières
 */
@Controller('api/admin/finance')
@UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // ===== Routes Budgets =====

  @Get('budgets')
  // @RequirePermission // TODO: Restore('admin.view')
  async getBudgets(
    @Query('period') period?: string,
    @Query('year') year?: string,
    @Query('category') category?: string,
  ) {
    const options: any = {};
    if (period) options.period = period;
    if (year) options.year = parseInt(year, 10);
    if (category) options.category = category;
    return await this.financialService.getBudgets(options);
  }

  @Get('budgets/:id')
  // @RequirePermission // TODO: Restore('admin.view')
  async getBudgetById(@Param('id') id: string) {
    return await this.financialService.getBudgetById(id);
  }

  @Post('budgets')
  // @RequirePermission // TODO: Restore('admin.manage')
  async createBudget(@Body() body: unknown) {
    return await this.financialService.createBudget(body);
  }

  @Put('budgets/:id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async updateBudget(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateBudget(id, body);
  }

  @Delete('budgets/:id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async deleteBudget(@Param('id') id: string) {
    return await this.financialService.deleteBudget(id);
  }

  @Get('budgets/stats')
  // @RequirePermission // TODO: Restore('admin.view')
  async getBudgetStats(
    @Query('period') period?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return await this.financialService.getBudgetStats(period, yearNum);
  }

  // ===== Routes Expenses =====

  @Get('expenses')
  // @RequirePermission // TODO: Restore('admin.view')
  async getExpenses(
    @Query('period') period?: string,
    @Query('year') year?: string,
    @Query('category') category?: string,
    @Query('budgetId') budgetId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const options: any = {};
    if (period) options.period = period;
    if (year) options.year = parseInt(year, 10);
    if (category) options.category = category;
    if (budgetId) options.budgetId = budgetId;
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    return await this.financialService.getExpenses(options);
  }

  @Get('expenses/:id')
  // @RequirePermission // TODO: Restore('admin.view')
  async getExpenseById(@Param('id') id: string) {
    return await this.financialService.getExpenseById(id);
  }

  @Post('expenses')
  // @RequirePermission // TODO: Restore('admin.manage')
  async createExpense(@Body() body: unknown) {
    return await this.financialService.createExpense(body);
  }

  @Put('expenses/:id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async updateExpense(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateExpense(id, body);
  }

  @Delete('expenses/:id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async deleteExpense(@Param('id') id: string) {
    return await this.financialService.deleteExpense(id);
  }

  @Get('expenses/stats')
  // @RequirePermission // TODO: Restore('admin.view')
  async getExpenseStats(
    @Query('period') period?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return await this.financialService.getExpenseStats(period, yearNum);
  }

  // ===== Routes Categories =====

  @Get('categories')
  // @RequirePermission // TODO: Restore('admin.view')
  async getCategories(@Query('type') type?: string) {
    return await this.financialService.getCategories(type);
  }

  @Post('categories')
  // @RequirePermission // TODO: Restore('admin.manage')
  async createCategory(@Body() body: unknown) {
    return await this.financialService.createCategory(body);
  }

  @Put('categories/:id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async updateCategory(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateCategory(id, body);
  }

  // ===== Routes Forecasts =====

  @Get('forecasts')
  // @RequirePermission // TODO: Restore('admin.view')
  async getForecasts(
    @Query('period') period?: string,
    @Query('year') year?: string,
    @Query('category') category?: string,
  ) {
    const options: any = {};
    if (period) options.period = period;
    if (year) options.year = parseInt(year, 10);
    if (category) options.category = category;
    return await this.financialService.getForecasts(options);
  }

  @Post('forecasts')
  // @RequirePermission // TODO: Restore('admin.manage')
  async createForecast(@Body() body: unknown) {
    return await this.financialService.createForecast(body);
  }

  @Put('forecasts/:id')
  // @RequirePermission // TODO: Restore('admin.manage')
  async updateForecast(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateForecast(id, body);
  }

  @Post('forecasts/generate')
  // @RequirePermission // TODO: Restore('admin.manage')
  async generateForecasts(@Body() body: { period: string; year: number }) {
    if (!body.period || !body.year) {
      throw new BadRequestException('period et year sont requis');
    }
    return await this.financialService.generateForecasts(body.period, body.year);
  }

  // ===== Routes KPIs & Reports =====

  @Get('kpis/extended')
  // @RequirePermission // TODO: Restore('admin.view')
  async getFinancialKPIsExtended(
    @Query('period') period?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return await this.financialService.getFinancialKPIsExtended(period, yearNum);
  }

  @Get('comparison')
  // @RequirePermission // TODO: Restore('admin.view')
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
  // @RequirePermission // TODO: Restore('admin.view')
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

