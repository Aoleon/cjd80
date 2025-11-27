import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StorageService } from '../common/storage/storage.service';
import {
  insertFinancialBudgetSchema,
  updateFinancialBudgetSchema,
  insertFinancialExpenseSchema,
  updateFinancialExpenseSchema,
  insertFinancialCategorySchema,
  updateFinancialCategorySchema,
  insertFinancialForecastSchema,
  updateFinancialForecastSchema,
} from '../../../shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Service Financial - Gestion financière
 */
@Injectable()
export class FinancialService {
  constructor(private readonly storageService: StorageService) {}

  // ===== Routes Budgets =====

  async getBudgets(options: {
    period?: string;
    year?: number;
    category?: string;
  }) {
    const result = await this.storageService.instance.getBudgets(options);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  async getBudgetById(id: string) {
    const result = await this.storageService.instance.getBudgetById(id);
    if (!result.success) {
      throw new NotFoundException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  async createBudget(data: unknown) {
    try {
      const validated = insertFinancialBudgetSchema.parse(data);
      const result = await this.storageService.instance.createBudget(validated);
      if (!result.success) {
        throw new BadRequestException(result.error.message);
      }
      return { success: true, data: result.data };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  async updateBudget(id: string, data: unknown) {
    try {
      const validated = updateFinancialBudgetSchema.parse(data);
      const result = await this.storageService.instance.updateBudget(id, validated);
      if (!result.success) {
        throw new NotFoundException(result.error.message);
      }
      return { success: true, data: result.data };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  async deleteBudget(id: string) {
    const result = await this.storageService.instance.deleteBudget(id);
    if (!result.success) {
      throw new NotFoundException(result.error.message);
    }
    return { success: true };
  }

  async getBudgetStats(period?: string, year?: number) {
    const result = await this.storageService.instance.getBudgetStats(period, year);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  // ===== Routes Expenses =====

  async getExpenses(options: {
    period?: string;
    year?: number;
    category?: string;
    budgetId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const result = await this.storageService.instance.getExpenses(options);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  async getExpenseById(id: string) {
    const result = await this.storageService.instance.getExpenseById(id);
    if (!result.success) {
      throw new NotFoundException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  async createExpense(data: unknown) {
    try {
      const validated = insertFinancialExpenseSchema.parse(data);
      const result = await this.storageService.instance.createExpense(validated);
      if (!result.success) {
        throw new BadRequestException(result.error.message);
      }
      return { success: true, data: result.data };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  async updateExpense(id: string, data: unknown) {
    try {
      const validated = updateFinancialExpenseSchema.parse(data);
      const result = await this.storageService.instance.updateExpense(id, validated);
      if (!result.success) {
        throw new NotFoundException(result.error.message);
      }
      return { success: true, data: result.data };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  async deleteExpense(id: string) {
    const result = await this.storageService.instance.deleteExpense(id);
    if (!result.success) {
      throw new NotFoundException(result.error.message);
    }
    return { success: true };
  }

  async getExpenseStats(period?: string, year?: number) {
    const result = await this.storageService.instance.getExpenseStats(period, year);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  // ===== Routes Categories =====

  async getCategories(type?: string) {
    const result = await this.storageService.instance.getFinancialCategories(type);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  async createCategory(data: unknown) {
    try {
      const validated = insertFinancialCategorySchema.parse(data);
      const result = await this.storageService.instance.createCategory(validated);
      if (!result.success) {
        throw new BadRequestException(result.error.message);
      }
      return { success: true, data: result.data };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  async updateCategory(id: string, data: unknown) {
    try {
      const validated = updateFinancialCategorySchema.parse(data);
      const result = await this.storageService.instance.updateCategory(id, validated);
      if (!result.success) {
        throw new NotFoundException(result.error.message);
      }
      return { success: true, data: result.data };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  // ===== Routes Forecasts =====

  async getForecasts(options: {
    period?: string;
    year?: number;
    category?: string;
  }) {
    const result = await this.storageService.instance.getForecasts(options);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  async createForecast(data: unknown) {
    try {
      const validated = insertFinancialForecastSchema.parse(data);
      const result = await this.storageService.instance.createForecast(validated);
      if (!result.success) {
        throw new BadRequestException(result.error.message);
      }
      return { success: true, data: result.data };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  async updateForecast(id: string, data: unknown) {
    try {
      const validated = updateFinancialForecastSchema.parse(data);
      const result = await this.storageService.instance.updateForecast(id, validated);
      if (!result.success) {
        throw new NotFoundException(result.error.message);
      }
      return { success: true, data: result.data };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  async generateForecasts(period: string, year: number) {
    const result = await this.storageService.instance.generateForecasts(period, year);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  // ===== Routes KPIs & Reports =====

  async getFinancialKPIsExtended(period?: string, year?: number) {
    const result = await this.storageService.instance.getFinancialKPIsExtended(period, year);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  async getFinancialComparison(
    period1: string,
    year1: number,
    period2: string,
    year2: number,
  ) {
    const result = await this.storageService.instance.getFinancialComparison(
      { period: period1, year: year1 },
      { period: period2, year: year2 },
    );
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { success: true, data: result.data };
  }

  async getFinancialReport(type: 'monthly' | 'quarterly' | 'yearly', period: number, year: number) {
    const result = await this.storageService.instance.getFinancialReport(type, period, year);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { success: true, data: result.data };
  }
}

