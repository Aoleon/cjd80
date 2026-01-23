import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { StorageService } from '../common/storage/storage.service';

describe('FinancialService', () => {
  let service: FinancialService;
  let storageService: StorageService;

  beforeEach(() => {
    // Mock StorageService
    storageService = {
      instance: {
        getBudgets: vi.fn(),
        getBudgetById: vi.fn(),
        createBudget: vi.fn(),
        updateBudget: vi.fn(),
        deleteBudget: vi.fn(),
        getBudgetStats: vi.fn(),
        getExpenses: vi.fn(),
        getExpenseById: vi.fn(),
        createExpense: vi.fn(),
        updateExpense: vi.fn(),
        deleteExpense: vi.fn(),
        getExpenseStats: vi.fn(),
        getFinancialCategories: vi.fn(),
        createCategory: vi.fn(),
        updateCategory: vi.fn(),
        getForecasts: vi.fn(),
        createForecast: vi.fn(),
        updateForecast: vi.fn(),
        generateForecasts: vi.fn(),
        getFinancialKPIsExtended: vi.fn(),
        getFinancialComparison: vi.fn(),
        getFinancialReport: vi.fn(),
      },
    } as any;

    service = new FinancialService(storageService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Budgets - CRUD', () => {
    describe('getBudgets', () => {
      it('should return budgets successfully', async () => {
        const mockBudgets = [
          {
            id: '1',
            name: 'Budget Q1',
            category: 'events',
            amountInCents: 100000,
            period: 'quarter',
            year: 2026,
          },
        ];

        vi.mocked(storageService.instance.getBudgets).mockResolvedValue({
          success: true,
          data: mockBudgets,
        });

        const result = await service.getBudgets({});
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockBudgets);
      });

      it('should throw BadRequestException on storage error', async () => {
        vi.mocked(storageService.instance.getBudgets).mockResolvedValue({
          success: false,
          error: new Error('Database error'),
        });

        await expect(service.getBudgets({})).rejects.toThrow(BadRequestException);
      });

      it('should filter budgets by period and year', async () => {
        const options = { period: 'Q1', year: 2026 };
        vi.mocked(storageService.instance.getBudgets).mockResolvedValue({
          success: true,
          data: [],
        });

        await service.getBudgets(options);
        expect(storageService.instance.getBudgets).toHaveBeenCalledWith(options);
      });
    });

    describe('getBudgetById', () => {
      it('should return budget by ID', async () => {
        const mockBudget = { id: '1', name: 'Budget Q1', amountInCents: 100000 };
        vi.mocked(storageService.instance.getBudgetById).mockResolvedValue({
          success: true,
          data: mockBudget,
        });

        const result = await service.getBudgetById('1');
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockBudget);
      });

      it('should throw NotFoundException when budget not found', async () => {
        vi.mocked(storageService.instance.getBudgetById).mockResolvedValue({
          success: false,
          error: new Error('Budget not found'),
        });

        await expect(service.getBudgetById('invalid-id')).rejects.toThrow(NotFoundException);
      });
    });

    describe('createBudget', () => {
      it('should create budget with valid data', async () => {
        const budgetData = {
          name: 'Budget Q1',
          category: '550e8400-e29b-41d4-a716-446655440000',
          amountInCents: 100000,
          period: 'quarter',
          year: 2026,
          createdBy: 'admin@example.com',
        };

        const mockBudget = { id: '1', ...budgetData };
        vi.mocked(storageService.instance.createBudget).mockResolvedValue({
          success: true,
          data: mockBudget,
        });

        const result = await service.createBudget(budgetData);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockBudget);
      });

      it('should throw BadRequestException for invalid Zod schema', async () => {
        const invalidData = { name: '' }; // Missing required fields

        await expect(service.createBudget(invalidData)).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException for storage error', async () => {
        const budgetData = {
          name: 'Budget Q1',
          category: '550e8400-e29b-41d4-a716-446655440000',
          amountInCents: 100000,
          period: 'quarter',
          year: 2026,
          createdBy: 'admin@example.com',
        };

        vi.mocked(storageService.instance.createBudget).mockResolvedValue({
          success: false,
          error: new Error('Storage error'),
        });

        await expect(service.createBudget(budgetData)).rejects.toThrow(BadRequestException);
      });

      it('should validate amountInCents is non-negative', async () => {
        const invalidData = {
          name: 'Budget Q1',
          category: '550e8400-e29b-41d4-a716-446655440000',
          amountInCents: -100,
          period: 'quarter',
          year: 2026,
          createdBy: 'admin@example.com',
        };

        await expect(service.createBudget(invalidData)).rejects.toThrow(BadRequestException);
      });
    });

    describe('updateBudget', () => {
      it('should update budget with valid data', async () => {
        const updateData = { name: 'Updated Budget', amountInCents: 150000 };
        const mockBudget = { id: '1', ...updateData };

        vi.mocked(storageService.instance.updateBudget).mockResolvedValue({
          success: true,
          data: mockBudget,
        });

        const result = await service.updateBudget('1', updateData);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockBudget);
      });

      it('should throw NotFoundException when budget not found', async () => {
        vi.mocked(storageService.instance.updateBudget).mockResolvedValue({
          success: false,
          error: new Error('Budget not found'),
        });

        await expect(service.updateBudget('invalid-id', {})).rejects.toThrow(NotFoundException);
      });

      it('should validate partial schema on update', async () => {
        const updateData = { amountInCents: -50 };

        await expect(service.updateBudget('1', updateData)).rejects.toThrow(BadRequestException);
      });
    });

    describe('deleteBudget', () => {
      it('should delete budget successfully', async () => {
        vi.mocked(storageService.instance.deleteBudget).mockResolvedValue({
          success: true,
        });

        const result = await service.deleteBudget('1');
        expect(result.success).toBe(true);
      });

      it('should throw NotFoundException when budget not found', async () => {
        vi.mocked(storageService.instance.deleteBudget).mockResolvedValue({
          success: false,
          error: new Error('Budget not found'),
        });

        await expect(service.deleteBudget('invalid-id')).rejects.toThrow(NotFoundException);
      });
    });

    describe('getBudgetStats', () => {
      it('should return budget statistics', async () => {
        const mockStats = {
          totalBudget: 500000,
          totalSpent: 250000,
          remaining: 250000,
          utilizationRate: 50,
        };

        vi.mocked(storageService.instance.getBudgetStats).mockResolvedValue({
          success: true,
          data: mockStats,
        });

        const result = await service.getBudgetStats('Q1', 2026);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockStats);
        expect(result.data.utilizationRate).toBe(50);
      });

      it('should handle stats calculation correctly', async () => {
        const mockStats = {
          totalBudget: 100000,
          totalSpent: 50000,
          remaining: 50000,
          utilizationRate: 50,
        };

        vi.mocked(storageService.instance.getBudgetStats).mockResolvedValue({
          success: true,
          data: mockStats,
        });

        const result = await service.getBudgetStats('Q1', 2026);
        expect(result.data.remaining).toBe(result.data.totalBudget - result.data.totalSpent);
      });
    });
  });

  describe('Expenses - CRUD', () => {
    describe('getExpenses', () => {
      it('should return expenses successfully', async () => {
        const mockExpenses = [
          {
            id: '1',
            description: 'Conference room rental',
            amountInCents: 50000,
            category: 'events',
            expenseDate: '2026-01-15',
          },
        ];

        vi.mocked(storageService.instance.getExpenses).mockResolvedValue({
          success: true,
          data: mockExpenses,
        });

        const result = await service.getExpenses({});
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockExpenses);
      });

      it('should filter expenses by date range', async () => {
        const options = {
          startDate: '2026-01-01',
          endDate: '2026-03-31',
        };

        vi.mocked(storageService.instance.getExpenses).mockResolvedValue({
          success: true,
          data: [],
        });

        await service.getExpenses(options);
        expect(storageService.instance.getExpenses).toHaveBeenCalledWith(options);
      });

      it('should filter expenses by budget ID', async () => {
        const options = { budgetId: '123' };
        vi.mocked(storageService.instance.getExpenses).mockResolvedValue({
          success: true,
          data: [],
        });

        await service.getExpenses(options);
        expect(storageService.instance.getExpenses).toHaveBeenCalledWith(options);
      });
    });

    describe('getExpenseById', () => {
      it('should return expense by ID', async () => {
        const mockExpense = {
          id: '1',
          description: 'Conference room',
          amountInCents: 50000,
        };

        vi.mocked(storageService.instance.getExpenseById).mockResolvedValue({
          success: true,
          data: mockExpense,
        });

        const result = await service.getExpenseById('1');
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockExpense);
      });

      it('should throw NotFoundException when expense not found', async () => {
        vi.mocked(storageService.instance.getExpenseById).mockResolvedValue({
          success: false,
          error: new Error('Expense not found'),
        });

        await expect(service.getExpenseById('invalid-id')).rejects.toThrow(NotFoundException);
      });
    });

    describe('createExpense', () => {
      it('should create expense with valid data', async () => {
        const expenseData = {
          description: 'Conference room rental',
          amountInCents: 50000,
          category: '550e8400-e29b-41d4-a716-446655440000',
          expenseDate: '2026-01-15',
          createdBy: 'admin@example.com',
        };

        const mockExpense = { id: '1', ...expenseData };
        vi.mocked(storageService.instance.createExpense).mockResolvedValue({
          success: true,
          data: mockExpense,
        });

        const result = await service.createExpense(expenseData);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockExpense);
      });

      it('should validate amountInCents is non-negative', async () => {
        const invalidData = {
          description: 'Expense',
          amountInCents: -100,
          category: '550e8400-e29b-41d4-a716-446655440000',
          expenseDate: '2026-01-15',
          createdBy: 'admin@example.com',
        };

        await expect(service.createExpense(invalidData)).rejects.toThrow(BadRequestException);
      });

      it('should validate date format YYYY-MM-DD', async () => {
        const invalidData = {
          description: 'Expense',
          amountInCents: 50000,
          category: '550e8400-e29b-41d4-a716-446655440000',
          expenseDate: '01-15-2026',
          createdBy: 'admin@example.com',
        };

        await expect(service.createExpense(invalidData)).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException for invalid Zod schema', async () => {
        const invalidData = { description: '' };

        await expect(service.createExpense(invalidData)).rejects.toThrow(BadRequestException);
      });
    });

    describe('updateExpense', () => {
      it('should update expense with valid data', async () => {
        const updateData = { description: 'Updated description', amountInCents: 60000 };
        const mockExpense = { id: '1', ...updateData };

        vi.mocked(storageService.instance.updateExpense).mockResolvedValue({
          success: true,
          data: mockExpense,
        });

        const result = await service.updateExpense('1', updateData);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockExpense);
      });

      it('should throw NotFoundException when expense not found', async () => {
        vi.mocked(storageService.instance.updateExpense).mockResolvedValue({
          success: false,
          error: new Error('Expense not found'),
        });

        await expect(service.updateExpense('invalid-id', {})).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteExpense', () => {
      it('should delete expense successfully', async () => {
        vi.mocked(storageService.instance.deleteExpense).mockResolvedValue({
          success: true,
        });

        const result = await service.deleteExpense('1');
        expect(result.success).toBe(true);
      });

      it('should throw NotFoundException when expense not found', async () => {
        vi.mocked(storageService.instance.deleteExpense).mockResolvedValue({
          success: false,
          error: new Error('Expense not found'),
        });

        await expect(service.deleteExpense('invalid-id')).rejects.toThrow(NotFoundException);
      });
    });

    describe('getExpenseStats', () => {
      it('should return expense statistics', async () => {
        const mockStats = {
          totalExpenses: 250000,
          averageExpense: 50000,
          expenseCount: 5,
          byCategory: { events: 150000, marketing: 100000 },
        };

        vi.mocked(storageService.instance.getExpenseStats).mockResolvedValue({
          success: true,
          data: mockStats,
        });

        const result = await service.getExpenseStats('Q1', 2026);
        expect(result.success).toBe(true);
        expect(result.data.totalExpenses).toBe(250000);
        expect(result.data.expenseCount).toBe(5);
      });

      it('should calculate average expense correctly', async () => {
        const mockStats = {
          totalExpenses: 100000,
          averageExpense: 25000,
          expenseCount: 4,
        };

        vi.mocked(storageService.instance.getExpenseStats).mockResolvedValue({
          success: true,
          data: mockStats,
        });

        const result = await service.getExpenseStats('Q1', 2026);
        const calculatedAverage = result.data.totalExpenses / result.data.expenseCount;
        expect(calculatedAverage).toBe(25000);
      });
    });
  });

  describe('Categories', () => {
    describe('getCategories', () => {
      it('should return categories successfully', async () => {
        const mockCategories = [
          { id: '1', name: 'Events', type: 'expense' },
          { id: '2', name: 'Marketing', type: 'expense' },
        ];

        vi.mocked(storageService.instance.getFinancialCategories).mockResolvedValue({
          success: true,
          data: mockCategories,
        });

        const result = await service.getCategories();
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCategories);
      });

      it('should filter categories by type', async () => {
        vi.mocked(storageService.instance.getFinancialCategories).mockResolvedValue({
          success: true,
          data: [],
        });

        await service.getCategories('expense');
        expect(storageService.instance.getFinancialCategories).toHaveBeenCalledWith('expense');
      });
    });

    describe('createCategory', () => {
      it('should create category with valid data', async () => {
        const categoryData = {
          name: 'Marketing',
          type: 'expense',
          description: 'Marketing expenses',
        };

        const mockCategory = { id: '1', ...categoryData };
        vi.mocked(storageService.instance.createCategory).mockResolvedValue({
          success: true,
          data: mockCategory,
        });

        const result = await service.createCategory(categoryData);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCategory);
      });

      it('should throw BadRequestException for invalid schema', async () => {
        const invalidData = { name: '' };

        await expect(service.createCategory(invalidData)).rejects.toThrow(BadRequestException);
      });
    });

    describe('updateCategory', () => {
      it('should update category with valid data', async () => {
        const updateData = { name: 'Updated Category' };
        const mockCategory = { id: '1', ...updateData };

        vi.mocked(storageService.instance.updateCategory).mockResolvedValue({
          success: true,
          data: mockCategory,
        });

        const result = await service.updateCategory('1', updateData);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCategory);
      });

      it('should throw NotFoundException when category not found', async () => {
        vi.mocked(storageService.instance.updateCategory).mockResolvedValue({
          success: false,
          error: new Error('Category not found'),
        });

        await expect(service.updateCategory('invalid-id', {})).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('Forecasts', () => {
    describe('getForecasts', () => {
      it('should return forecasts successfully', async () => {
        const mockForecasts = [
          {
            id: '1',
            category: 'events',
            forecastedAmountInCents: 500000,
            period: 'quarter',
          },
        ];

        vi.mocked(storageService.instance.getForecasts).mockResolvedValue({
          success: true,
          data: mockForecasts,
        });

        const result = await service.getForecasts({});
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockForecasts);
      });
    });

    describe('createForecast', () => {
      it('should create forecast with valid data', async () => {
        const forecastData = {
          category: '550e8400-e29b-41d4-a716-446655440000',
          period: 'quarter',
          year: 2026,
          forecastedAmountInCents: 500000,
          confidence: 'high',
          basedOn: 'historical',
          createdBy: 'admin@example.com',
        };

        const mockForecast = { id: '1', ...forecastData };
        vi.mocked(storageService.instance.createForecast).mockResolvedValue({
          success: true,
          data: mockForecast,
        });

        const result = await service.createForecast(forecastData);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockForecast);
      });

      it('should throw BadRequestException for invalid schema', async () => {
        const invalidData = { category: 'invalid-uuid' };

        await expect(service.createForecast(invalidData)).rejects.toThrow(BadRequestException);
      });
    });

    describe('updateForecast', () => {
      it('should update forecast with valid data', async () => {
        const updateData = { forecastedAmountInCents: 600000 };
        const mockForecast = { id: '1', ...updateData };

        vi.mocked(storageService.instance.updateForecast).mockResolvedValue({
          success: true,
          data: mockForecast,
        });

        const result = await service.updateForecast('1', updateData);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockForecast);
      });
    });

    describe('generateForecasts', () => {
      it('should generate forecasts for a period', async () => {
        const mockForecasts = [
          { category: 'events', forecastedAmountInCents: 500000 },
          { category: 'marketing', forecastedAmountInCents: 300000 },
        ];

        vi.mocked(storageService.instance.generateForecasts).mockResolvedValue({
          success: true,
          data: mockForecasts,
        });

        const result = await service.generateForecasts('Q2', 2026);
        expect(result.success).toBe(true);
        expect(result.data.length).toBe(2);
      });
    });
  });

  describe('Financial Calculations', () => {
    it('should calculate budget utilization rate', async () => {
      const mockStats = {
        totalBudget: 1000000,
        totalSpent: 600000,
        remaining: 400000,
        utilizationRate: 60,
      };

      vi.mocked(storageService.instance.getBudgetStats).mockResolvedValue({
        success: true,
        data: mockStats,
      });

      const result = await service.getBudgetStats('Q1', 2026);
      expect(result.data.utilizationRate).toBe((result.data.totalSpent / result.data.totalBudget) * 100);
    });

    it('should identify overspend condition', async () => {
      const mockStats = {
        totalBudget: 100000,
        totalSpent: 150000,
        remaining: -50000,
        isOverbudget: true,
      };

      vi.mocked(storageService.instance.getBudgetStats).mockResolvedValue({
        success: true,
        data: mockStats,
      });

      const result = await service.getBudgetStats('Q1', 2026);
      expect(result.data.remaining).toBeLessThan(0);
      expect(result.data.isOverbudget).toBe(true);
    });

    it('should validate all amount fields are in cents', async () => {
      const budgetData = {
        name: 'Test Budget',
        category: '550e8400-e29b-41d4-a716-446655440000',
        amountInCents: 100000,
        period: 'quarter',
        year: 2026,
        createdBy: 'admin@example.com',
      };

      vi.mocked(storageService.instance.createBudget).mockResolvedValue({
        success: true,
        data: { id: '1', ...budgetData },
      });

      const result = await service.createBudget(budgetData);
      expect(result.data.amountInCents).toBe(100000);
      expect(result.data.amountInCents % 1).toBe(0); // Should be integer
    });
  });

  describe('KPIs and Reports', () => {
    describe('getFinancialKPIsExtended', () => {
      it('should return extended financial KPIs', async () => {
        const mockKPIs = {
          totalIncome: 1000000,
          totalExpenses: 600000,
          netProfit: 400000,
          profitMargin: 40,
          budgetUtilization: 60,
        };

        vi.mocked(storageService.instance.getFinancialKPIsExtended).mockResolvedValue({
          success: true,
          data: mockKPIs,
        });

        const result = await service.getFinancialKPIsExtended('Q1', 2026);
        expect(result.success).toBe(true);
        expect(result.data.netProfit).toBe(400000);
      });
    });

    describe('getFinancialComparison', () => {
      it('should compare two periods', async () => {
        const mockComparison = {
          period1: { expenses: 500000, budget: 800000 },
          period2: { expenses: 600000, budget: 800000 },
          variance: 100000,
          percentChange: 20,
        };

        vi.mocked(storageService.instance.getFinancialComparison).mockResolvedValue({
          success: true,
          data: mockComparison,
        });

        const result = await service.getFinancialComparison('Q1', 2025, 'Q1', 2026);
        expect(result.success).toBe(true);
        expect(result.data.percentChange).toBe(20);
      });
    });

    describe('getFinancialReport', () => {
      it('should generate monthly report', async () => {
        const mockReport = {
          type: 'monthly',
          period: 1,
          year: 2026,
          totalExpenses: 50000,
          totalIncome: 100000,
        };

        vi.mocked(storageService.instance.getFinancialReport).mockResolvedValue({
          success: true,
          data: mockReport,
        });

        const result = await service.getFinancialReport('monthly', 1, 2026);
        expect(result.success).toBe(true);
        expect(result.data.type).toBe('monthly');
      });

      it('should generate quarterly report', async () => {
        const mockReport = {
          type: 'quarterly',
          period: 1,
          year: 2026,
          totalExpenses: 150000,
        };

        vi.mocked(storageService.instance.getFinancialReport).mockResolvedValue({
          success: true,
          data: mockReport,
        });

        const result = await service.getFinancialReport('quarterly', 1, 2026);
        expect(result.success).toBe(true);
        expect(result.data.type).toBe('quarterly');
      });

      it('should generate yearly report', async () => {
        const mockReport = {
          type: 'yearly',
          period: 1,
          year: 2026,
          totalExpenses: 600000,
        };

        vi.mocked(storageService.instance.getFinancialReport).mockResolvedValue({
          success: true,
          data: mockReport,
        });

        const result = await service.getFinancialReport('yearly', 1, 2026);
        expect(result.success).toBe(true);
        expect(result.data.type).toBe('yearly');
      });
    });
  });
});
