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
import { Loader2, TrendingUp, TrendingDown, DollarSign, PieChart, Plus, Download, Pencil, Trash2 } from 'lucide-react';
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
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showBudgetDeleteConfirmDialog, setShowBudgetDeleteConfirmDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

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

  const [editExpenseForm, setEditExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [editBudgetForm, setEditBudgetForm] = useState({
    name: '',
    category: '',
    amount: '',
    period: 'year' as 'month' | 'quarter' | 'year',
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

  const updateExpenseMutation = useMutation({
    mutationFn: (data: {
      id: string;
      description: string;
      amountInCents: number;
      category: string;
      expenseDate: string;
    }) => api.put(`/api/admin/finance/expenses/${data.id}`, {
      description: data.description,
      amountInCents: data.amountInCents,
      category: data.category,
      expenseDate: data.expenseDate,
    }),
    onSuccess: () => {
      toast({
        title: 'Depense modifiee',
        description: 'La depense a ete mise a jour avec succes',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.all });
      setShowEditExpenseModal(false);
      setSelectedExpense(null);
      resetEditExpenseForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/finance/expenses/${id}`),
    onSuccess: () => {
      toast({
        title: 'Depense supprimee',
        description: 'La depense a ete supprimee avec succes',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.all });
      setShowDeleteConfirmDialog(false);
      setSelectedExpense(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      category: string;
      amountInCents: number;
      period: 'month' | 'quarter' | 'year';
    }) => api.put(`/api/admin/finance/budgets/${data.id}`, {
      name: data.name,
      category: data.category,
      amountInCents: data.amountInCents,
      period: data.period,
    }),
    onSuccess: () => {
      toast({
        title: 'Budget modifie',
        description: 'Le budget a ete mis a jour avec succes',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.all });
      setShowEditBudgetModal(false);
      setSelectedBudget(null);
      resetEditBudgetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/finance/budgets/${id}`),
    onSuccess: () => {
      toast({
        title: 'Budget supprime',
        description: 'Le budget a ete supprime avec succes',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.financial.all });
      setShowBudgetDeleteConfirmDialog(false);
      setSelectedBudget(null);
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

  const resetEditExpenseForm = () => {
    setEditExpenseForm({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const resetEditBudgetForm = () => {
    setEditBudgetForm({
      name: '',
      category: '',
      amount: '',
      period: 'year',
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

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditExpenseForm({
      description: expense.description,
      amount: (expense.amount / 100).toString(),
      category: expense.category || '',
      date: expense.date.split('T')[0],
    });
    setShowEditExpenseModal(true);
  };

  const handleSaveEditExpense = () => {
    if (!editExpenseForm.description || !editExpenseForm.amount || !selectedExpense) {
      toast({
        title: 'Erreur',
        description: 'La description et le montant sont obligatoires',
        variant: 'destructive',
      });
      return;
    }

    updateExpenseMutation.mutate({
      id: selectedExpense.id,
      description: editExpenseForm.description,
      amountInCents: Math.round(parseFloat(editExpenseForm.amount) * 100),
      category: editExpenseForm.category,
      expenseDate: editExpenseForm.date,
    });
  };

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedExpense) {
      deleteExpenseMutation.mutate(selectedExpense.id);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setEditBudgetForm({
      name: budget.name,
      category: budget.category || '',
      amount: (budget.amount / 100).toString(),
      period: (budget.period as 'month' | 'quarter' | 'year') || 'year',
    });
    setShowEditBudgetModal(true);
  };

  const handleSaveEditBudget = () => {
    if (!editBudgetForm.name || !editBudgetForm.amount || !selectedBudget) {
      toast({
        title: 'Erreur',
        description: 'Le nom et le montant sont obligatoires',
        variant: 'destructive',
      });
      return;
    }

    updateBudgetMutation.mutate({
      id: selectedBudget.id,
      name: editBudgetForm.name,
      category: editBudgetForm.category,
      amountInCents: Math.round(parseFloat(editBudgetForm.amount) * 100),
      period: editBudgetForm.period,
    });
  };

  const handleDeleteBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowBudgetDeleteConfirmDialog(true);
  };

  const handleConfirmBudgetDelete = () => {
    if (selectedBudget) {
      deleteBudgetMutation.mutate(selectedBudget.id);
    }
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
              <TrendingDown className="h-4 w-4 text-error" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error-dark">
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
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpiData.balance >= 0 ? 'text-success-dark' : 'text-error-dark'}`}>
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
                      <TableHead className="text-right">Actions</TableHead>
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
                          <TableCell className="text-right text-error-dark">
                            {formatCurrency(budget.spent || 0)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(budget.amount - (budget.spent || 0))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Modifier"
                                onClick={() => handleEditBudget(budget)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Supprimer"
                                onClick={() => handleDeleteBudget(budget)}
                                className="h-8 w-8 text-error hover:text-error-dark hover:bg-error/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                      <TableHead className="text-right">Actions</TableHead>
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
                          <TableCell className="text-right text-error-dark font-medium">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Modifier"
                                onClick={() => handleEditExpense(expense)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Supprimer"
                                onClick={() => handleDeleteExpense(expense)}
                                className="h-8 w-8 text-error hover:text-error-dark hover:bg-error/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
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
                  <span className="font-bold text-error-dark">{formatCurrency(budgetStatsData.totalSpent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Nombre de budgets:</span>
                  <span className="font-bold">{budgetStatsData.count}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Solde:</span>
                  <span className={`font-bold text-lg ${budgetStatsData.balance >= 0 ? 'text-success-dark' : 'text-error-dark'}`}>
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
                  <span className="font-bold text-error-dark">{formatCurrency(expenseStatsData.total)}</span>
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

      {/* Modal edition budget */}
      <Dialog open={showEditBudgetModal} onOpenChange={setShowEditBudgetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le budget</DialogTitle>
            <DialogDescription>
              Mettez a jour les details du budget
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-budget-name">Nom du budget *</Label>
              <Input
                id="edit-budget-name"
                value={editBudgetForm.name}
                onChange={(e) => setEditBudgetForm({ ...editBudgetForm, name: e.target.value })}
                placeholder="Ex: Evenements Q1"
              />
            </div>
            <div>
              <Label htmlFor="edit-budget-category">Categorie</Label>
              <Input
                id="edit-budget-category"
                value={editBudgetForm.category}
                onChange={(e) => setEditBudgetForm({ ...editBudgetForm, category: e.target.value })}
                placeholder="Ex: Evenements"
              />
            </div>
            <div>
              <Label htmlFor="edit-budget-amount">Montant *</Label>
              <Input
                id="edit-budget-amount"
                type="number"
                step="0.01"
                value={editBudgetForm.amount}
                onChange={(e) => setEditBudgetForm({ ...editBudgetForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="edit-budget-period">Periode</Label>
              <Select
                value={editBudgetForm.period}
                onValueChange={(val) => setEditBudgetForm({ ...editBudgetForm, period: val as 'month' | 'quarter' | 'year' })}
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
            <Button variant="outline" onClick={() => setShowEditBudgetModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEditBudget} disabled={updateBudgetMutation.isPending}>
              {updateBudgetMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression de budget */}
      <Dialog open={showBudgetDeleteConfirmDialog} onOpenChange={setShowBudgetDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer le budget "{selectedBudget?.name}" ? Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBudgetDeleteConfirmDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmBudgetDelete}
              disabled={deleteBudgetMutation.isPending}
            >
              {deleteBudgetMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Supprimer
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

      {/* Modal edition depense */}
      <Dialog open={showEditExpenseModal} onOpenChange={setShowEditExpenseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la depense</DialogTitle>
            <DialogDescription>
              Mettez a jour les informations de la depense
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-expense-description">Description *</Label>
              <Input
                id="edit-expense-description"
                value={editExpenseForm.description}
                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, description: e.target.value })}
                placeholder="Ex: Location salle"
              />
            </div>
            <div>
              <Label htmlFor="edit-expense-category">Categorie</Label>
              <Input
                id="edit-expense-category"
                value={editExpenseForm.category}
                onChange={(e) => setEditExpenseForm({ ...editExpenseForm, category: e.target.value })}
                placeholder="Ex: Evenements"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-expense-amount">Montant *</Label>
                <Input
                  id="edit-expense-amount"
                  type="number"
                  step="0.01"
                  value={editExpenseForm.amount}
                  onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-expense-date">Date</Label>
                <Input
                  id="edit-expense-date"
                  type="date"
                  value={editExpenseForm.date}
                  onChange={(e) => setEditExpenseForm({ ...editExpenseForm, date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditExpenseModal(false);
              setSelectedExpense(null);
              resetEditExpenseForm();
            }}>
              Annuler
            </Button>
            <Button onClick={handleSaveEditExpense} disabled={updateExpenseMutation.isPending}>
              {updateExpenseMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog pour suppression */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer la depense</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer cette depense ? Cette action ne peut pas etre annulee.
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="bg-muted p-3 rounded-md space-y-2">
              <p className="text-sm"><span className="font-medium">Description:</span> {selectedExpense.description}</p>
              <p className="text-sm"><span className="font-medium">Montant:</span> {formatCurrency(selectedExpense.amount)}</p>
              <p className="text-sm"><span className="font-medium">Date:</span> {new Date(selectedExpense.date).toLocaleDateString('fr-FR')}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteConfirmDialog(false);
              setSelectedExpense(null);
            }}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteExpenseMutation.isPending}
            >
              {deleteExpenseMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
