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
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

/**
 * Controller Financial - Routes financières
 */
@Controller('api/admin/finance')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // ===== Routes Budgets =====

  @Get('budgets')
  @Permissions('admin.view')
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
  @Permissions('admin.view')
  async getBudgetById(@Param('id') id: string) {
    return await this.financialService.getBudgetById(id);
  }

  @Post('budgets')
  @Permissions('admin.manage')
  async createBudget(@Body() body: unknown) {
    return await this.financialService.createBudget(body);
  }

  @Put('budgets/:id')
  @Permissions('admin.manage')
  async updateBudget(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateBudget(id, body);
  }

  @Delete('budgets/:id')
  @Permissions('admin.manage')
  async deleteBudget(@Param('id') id: string) {
    return await this.financialService.deleteBudget(id);
  }

  @Get('budgets/stats')
  @Permissions('admin.view')
  async getBudgetStats(
    @Query('period') period?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return await this.financialService.getBudgetStats(period, yearNum);
  }

  // ===== Routes Expenses =====

  @Get('expenses')
  @Permissions('admin.view')
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
  @Permissions('admin.view')
  async getExpenseById(@Param('id') id: string) {
    return await this.financialService.getExpenseById(id);
  }

  @Post('expenses')
  @Permissions('admin.manage')
  async createExpense(@Body() body: unknown) {
    return await this.financialService.createExpense(body);
  }

  @Put('expenses/:id')
  @Permissions('admin.manage')
  async updateExpense(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateExpense(id, body);
  }

  @Delete('expenses/:id')
  @Permissions('admin.manage')
  async deleteExpense(@Param('id') id: string) {
    return await this.financialService.deleteExpense(id);
  }

  @Get('expenses/stats')
  @Permissions('admin.view')
  async getExpenseStats(
    @Query('period') period?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return await this.financialService.getExpenseStats(period, yearNum);
  }

  // ===== Routes Categories =====

  @Get('categories')
  @Permissions('admin.view')
  async getCategories(@Query('type') type?: string) {
    return await this.financialService.getCategories(type);
  }

  @Post('categories')
  @Permissions('admin.manage')
  async createCategory(@Body() body: unknown) {
    return await this.financialService.createCategory(body);
  }

  @Put('categories/:id')
  @Permissions('admin.manage')
  async updateCategory(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateCategory(id, body);
  }

  // ===== Routes Forecasts =====

  @Get('forecasts')
  @Permissions('admin.view')
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
  @Permissions('admin.manage')
  async createForecast(@Body() body: unknown) {
    return await this.financialService.createForecast(body);
  }

  @Put('forecasts/:id')
  @Permissions('admin.manage')
  async updateForecast(@Param('id') id: string, @Body() body: unknown) {
    return await this.financialService.updateForecast(id, body);
  }

  @Post('forecasts/generate')
  @Permissions('admin.manage')
  async generateForecasts(@Body() body: { period: string; year: number }) {
    if (!body.period || !body.year) {
      throw new BadRequestException('period et year sont requis');
    }
    return await this.financialService.generateForecasts(body.period, body.year);
  }

  // ===== Routes KPIs & Reports =====

  @Get('kpis/extended')
  @Permissions('admin.view')
  async getFinancialKPIsExtended(
    @Query('period') period?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return await this.financialService.getFinancialKPIsExtended(period, yearNum);
  }

  @Get('comparison')
  @Permissions('admin.view')
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

