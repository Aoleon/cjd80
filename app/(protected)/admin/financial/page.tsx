'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys, type ApiResponse } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, DollarSign, PieChart, Plus, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BudgetStats {
  totalAllocated: number;
  totalSpent: number;
  count: number;
  balance: number;
}

interface ExpenseStats {
  total: number;
  average: number;
  count: number;
  categoriesCount: number;
}

interface KPIs {
  totalBudget: number;
  totalExpenses: number;
  balance: number;
  utilizationRate: number;
}

interface Budget {
  id: string;
  name: string;
  category?: string;
  amount: number;
  spent?: number;
  period: string;
}

interface Expense {
  id: string;
  description: string;
  category?: string;
  amount: number;
  date: string;
}

/**
 * Page Dashboard Financier Admin
 * Vue d'ensemble des finances avec budgets et depenses
 */
export default function AdminFinancialPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Form states
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    category: '',
    amount: '',
    period: 'year' as 'month' | 'quarter' | 'year',
    year: currentYear,
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Queries
  const { data: budgetStats, isLoading: loadingBudgetStats } = useQuery({
    queryKey: queryKeys.financial.budgetStats({ year: selectedYear }),
    queryFn: () => api.get<ApiResponse<BudgetStats>>('/api/admin/finance/budgets/stats', { year: selectedYear }),
  });

  const { data: expenseStats, isLoading: loadingExpenseStats } = useQuery({
    queryKey: queryKeys.financial.expenseStats({ year: selectedYear }),
    queryFn: () => api.get<ApiResponse<ExpenseStats>>('/api/admin/finance/expenses/stats', { year: selectedYear }),
  });

  const { data: budgets, isLoading: loadingBudgets } = useQuery({
    queryKey: queryKeys.financial.budgets({ year: selectedYear }),
    queryFn: () => api.get<Budget[]>('/api/admin/finance/budgets', { year: selectedYear }),
  });

  const { data: expenses, isLoading: loadingExpenses } = useQuery({
    queryKey: queryKeys.financial.expenses({ year: selectedYear }),
    queryFn: () => api.get<Expense[]>('/api/admin/finance/expenses', { year: selectedYear }),
  });

  const { data: kpis, isLoading: loadingKpis } = useQuery({
    queryKey: queryKeys.financial.kpis({ year: selectedYear }),
    queryFn: () => api.get<ApiResponse<KPIs>>('/api/admin/finance/kpis/extended', { year: selectedYear }),
  });

  // Mutations
  const createBudgetMutation = useMutation({
    mutationFn: (data: {
      name: string;
      category: string;
      amountInCents: number;
      period: 'month' | 'quarter' | 'year';
      year: number;
      createdBy: string;
    }) => api.post('/api/admin/finance/budgets', data),
    onSuccess: () => {
      toast({
        title: 'Budget cree',
        description: 'Le budget a ete cree avec succes',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.all });
      setShowBudgetModal(false);
      resetBudgetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: {
      description: string;
      amountInCents: number;
      category: string;
      expenseDate: string;
      createdBy: string;
    }) => api.post('/api/admin/finance/expenses', data),
    onSuccess: () => {
      toast({
        title: 'Depense creee',
        description: 'La depense a ete enregistree avec succes',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.all });
      setShowExpenseModal(false);
      resetExpenseForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetBudgetForm = () => {
    setBudgetForm({
      name: '',
      category: '',
      amount: '',
      period: 'year',
      year: currentYear,
    });
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleCreateBudget = () => {
    if (!budgetForm.name || !budgetForm.amount) {
      toast({
        title: 'Erreur',
        description: 'Le nom et le montant sont obligatoires',
        variant: 'destructive',
      });
      return;
    }

    createBudgetMutation.mutate({
      name: budgetForm.name,
      category: budgetForm.category,
      amountInCents: Math.round(parseFloat(budgetForm.amount) * 100),
      period: budgetForm.period,
      year: budgetForm.year,
      createdBy: 'admin@cjd-amiens.fr', // TODO: get from session
    });
  };

  const handleCreateExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) {
      toast({
        title: 'Erreur',
        description: 'La description et le montant sont obligatoires',
        variant: 'destructive',
      });
      return;
    }

    createExpenseMutation.mutate({
      description: expenseForm.description,
      amountInCents: Math.round(parseFloat(expenseForm.amount) * 100),
      category: expenseForm.category,
      expenseDate: expenseForm.date,
      createdBy: 'admin@cjd-amiens.fr', // TODO: get from session
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const isLoading = loadingBudgetStats || loadingExpenseStats || loadingKpis;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Extract data with proper type narrowing
  const kpiData = (kpis && 'data' in kpis ? kpis.data : {
    totalBudget: 0,
    totalExpenses: 0,
    balance: 0,
    utilizationRate: 0
  }) as KPIs;

  const budgetStatsData = (budgetStats && 'data' in budgetStats ? budgetStats.data : {
    totalAllocated: 0,
    totalSpent: 0,
    count: 0,
    balance: 0
  }) as BudgetStats;

  const expenseStatsData = (expenseStats && 'data' in expenseStats ? expenseStats.data : {
    total: 0,
    average: 0,
    count: 0,
    categoriesCount: 0
  }) as ExpenseStats;

  const budgetsList = (budgets && Array.isArray(budgets) ? budgets : []) as Budget[];
  const expensesList = (expenses && Array.isArray(expenses) ? expenses : []) as Expense[];

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financier</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des finances de l'association
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" title="Exporter">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpiData.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Alloue pour {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Depenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(kpiData.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total depense
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Solde</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpiData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(kpiData.balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Disponible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Taux d'utilisation</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData.utilizationRate ? `${kpiData.utilizationRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Budget consomme
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour Budgets et Depenses */}
      <Tabs defaultValue="budgets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="expenses">Depenses</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Budgets alloues</CardTitle>
                  <CardDescription>
                    {budgetsList.length} budget(s) pour {selectedYear}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowBudgetModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau budget
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingBudgets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Categorie</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Depense</TableHead>
                      <TableHead className="text-right">Restant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetsList.length > 0 ? (
                      budgetsList.map((budget: Budget) => (
                        <TableRow key={budget.id}>
                          <TableCell className="font-medium">{budget.name}</TableCell>
                          <TableCell>
                            {budget.category ? (
                              <Badge variant="outline">{budget.category}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{budget.period}</TableCell>
                          <TableCell className="text-right">{formatCurrency(budget.amount)}</TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(budget.spent || 0)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(budget.amount - (budget.spent || 0))}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Aucun budget trouve
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Depenses enregistrees</CardTitle>
                  <CardDescription>
                    {expensesList.length} depense(s) pour {selectedYear}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowExpenseModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle depense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingExpenses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Categorie</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expensesList.length > 0 ? (
                      expensesList.map((expense: Expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.description}</TableCell>
                          <TableCell>
                            {expense.category ? (
                              <Badge variant="outline">{expense.category}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(expense.date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-medium">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Aucune depense trouvee
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques des Budgets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total alloue:</span>
                  <span className="font-bold">{formatCurrency(budgetStatsData.totalAllocated)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total depense:</span>
                  <span className="font-bold text-red-600">{formatCurrency(budgetStatsData.totalSpent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Nombre de budgets:</span>
                  <span className="font-bold">{budgetStatsData.count}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Solde:</span>
                  <span className={`font-bold text-lg ${budgetStatsData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(budgetStatsData.balance)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques des Depenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total depenses:</span>
                  <span className="font-bold text-red-600">{formatCurrency(expenseStatsData.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Moyenne par depense:</span>
                  <span className="font-bold">{formatCurrency(expenseStatsData.average)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Nombre de depenses:</span>
                  <span className="font-bold">{expenseStatsData.count}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Categories:</span>
                  <span className="font-bold">{expenseStatsData.categoriesCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal creation budget */}
      <Dialog open={showBudgetModal} onOpenChange={setShowBudgetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Creer un budget</DialogTitle>
            <DialogDescription>
              Definissez un nouveau budget pour l'association
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="budget-name">Nom du budget *</Label>
              <Input
                id="budget-name"
                value={budgetForm.name}
                onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                placeholder="Ex: Evenements Q1"
              />
            </div>
            <div>
              <Label htmlFor="budget-category">Categorie</Label>
              <Input
                id="budget-category"
                value={budgetForm.category}
                onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                placeholder="Ex: Evenements"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget-amount">Montant *</Label>
                <Input
                  id="budget-amount"
                  type="number"
                  step="0.01"
                  value={budgetForm.amount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="budget-year">Annee</Label>
                <Select
                  value={budgetForm.year.toString()}
                  onValueChange={(val) => setBudgetForm({ ...budgetForm, year: parseInt(val) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="budget-period">Periode</Label>
              <Select
                value={budgetForm.period}
                onValueChange={(val) => setBudgetForm({ ...budgetForm, period: val as 'month' | 'quarter' | 'year' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Annuel</SelectItem>
                  <SelectItem value="quarter">Trimestriel</SelectItem>
                  <SelectItem value="month">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBudgetModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateBudget} disabled={createBudgetMutation.isPending}>
              {createBudgetMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Creer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal creation depense */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer une depense</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle depense
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="expense-description">Description *</Label>
              <Input
                id="expense-description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="Ex: Location salle"
              />
            </div>
            <div>
              <Label htmlFor="expense-category">Categorie</Label>
              <Input
                id="expense-category"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                placeholder="Ex: Evenements"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expense-amount">Montant *</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="expense-date">Date</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateExpense} disabled={createExpenseMutation.isPending}>
              {createExpenseMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
