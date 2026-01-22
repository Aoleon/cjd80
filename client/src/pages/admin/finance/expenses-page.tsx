"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminQuery } from "@/hooks/use-admin-query";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminExpenseForm, { type ExpenseFormValues } from "@/components/admin/AdminExpenseForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Edit, Trash2, Euro, Calendar, Receipt, Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FinancialExpense, FinancialCategory, FinancialBudget } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const formatEuros = (cents: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
};

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
  } catch {
    return dateString;
  }
};

export default function AdminExpensesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterBudget, setFilterBudget] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";

  // Queries
  const { data: expensesResponse, isLoading: expensesLoading } = useAdminQuery<{ success: boolean; data: FinancialExpense[] }>(
    ["/api/admin/finance/expenses", filterYear, filterCategory, filterBudget],
    async () => {
      const params = new URLSearchParams();
      if (filterYear !== "all") params.append("year", filterYear);
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (filterBudget !== "all") params.append("budgetId", filterBudget);
      
      const res = await fetch(`/api/admin/finance/expenses?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return res.json();
    },
    {
      enabled: isSuperAdmin,
      staleTime: 2 * 60 * 1000,
    }
  );

  const expenses = expensesResponse?.data || [];

  const { data: categoriesResponse } = useAdminQuery<{ success: boolean; data: FinancialCategory[] }>(
    ["/api/admin/finance/categories"],
    async () => {
      const res = await fetch("/api/admin/finance/categories");
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
    {
      enabled: isSuperAdmin,
      staleTime: 5 * 60 * 1000,
    }
  );

  const categories = categoriesResponse?.data || [];

  const { data: budgetsResponse } = useAdminQuery<{ success: boolean; data: FinancialBudget[] }>(
    ["/api/admin/finance/budgets"],
    async () => {
      const res = await fetch("/api/admin/finance/budgets");
      if (!res.ok) throw new Error('Failed to fetch budgets');
      return res.json();
    },
    {
      enabled: isSuperAdmin,
      staleTime: 5 * 60 * 1000,
    }
  );

  const budgets = budgetsResponse?.data || [];

  const { data: statsResponse } = useAdminQuery<{ success: boolean; data: {
    totalExpenses: number;
    totalAmount: number;
    byCategory: { category: string; count: number; totalAmount: number }[];
    byPeriod: { period: string; count: number; totalAmount: number }[];
  } }>(
    ["/api/admin/finance/expenses/stats", filterYear],
    async () => {
      const params = new URLSearchParams();
      if (filterYear !== "all") params.append("year", filterYear);
      
      const res = await fetch(`/api/admin/finance/expenses/stats?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch expense stats');
      return res.json();
    },
    {
      enabled: isSuperAdmin,
      staleTime: 5 * 60 * 1000,
    }
  );

  const stats = statsResponse?.data;

  // Filtrage
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (filterYear !== "all") {
        const expenseYear = new Date(expense.expenseDate).getFullYear();
        if (expenseYear.toString() !== filterYear) return false;
      }
      if (filterCategory !== "all" && expense.category !== filterCategory) return false;
      if (filterBudget !== "all" && expense.budgetId !== filterBudget) return false;
      return true;
    });
  }, [expenses, filterYear, filterCategory, filterBudget]);

  // Mutations
  const createExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormValues) => {
      return apiRequest("POST", "/api/admin/finance/expenses", {
        ...data,
        createdBy: user?.email || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/expenses/stats"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Dépense créée",
        description: "La dépense a été créée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la dépense.",
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExpenseFormValues> }) => {
      return apiRequest("PUT", `/api/admin/finance/expenses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/expenses/stats"] });
      setIsEditDialogOpen(false);
      setEditingExpenseId(null);
      toast({
        title: "Dépense modifiée",
        description: "La dépense a été modifiée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification de la dépense.",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => {
      return apiRequest("DELETE", `/api/admin/finance/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/expenses/stats"] });
      setDeleteExpenseId(null);
      toast({
        title: "Dépense supprimée",
        description: "La dépense a été supprimée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de la dépense.",
        variant: "destructive",
      });
    },
  });

  const handleUploadReceipt = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload/receipt", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors de l'upload du justificatif");
      }
      
      const data = await res.json();
      return data.url || data.receiptUrl;
    } finally {
      setIsUploading(false);
    }
  };

  const editingExpense = editingExpenseId ? expenses.find(e => e.id === editingExpenseId) : null;
  const expenseCategories = categories.filter(c => c.type === "expense");

  const handleCreate = (data: ExpenseFormValues) => {
    createExpenseMutation.mutate(data);
  };

  const handleUpdate = (data: ExpenseFormValues) => {
    if (!editingExpenseId) return;
    updateExpenseMutation.mutate({ id: editingExpenseId, data });
  };

  const handleDelete = () => {
    if (!deleteExpenseId) return;
    deleteExpenseMutation.mutate(deleteExpenseId);
  };

  // Colonnes pour la table
  const columns = [
    {
      key: "description",
      label: "Description",
      render: (expense: FinancialExpense) => (
        <div className="font-medium">{expense.description}</div>
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      render: (expense: FinancialExpense) => {
        const category = categories.find(c => c.id === expense.category);
        return <Badge variant="outline">{category?.name || expense.category}</Badge>;
      },
    },
    {
      key: "date",
      label: "Date",
      render: (expense: FinancialExpense) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{formatDate(expense.expenseDate)}</span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Montant",
      render: (expense: FinancialExpense) => (
        <div className="flex items-center gap-2 font-semibold text-red-600">
          <Euro className="h-4 w-4" />
          <span>{formatEuros(expense.amountInCents)}</span>
        </div>
      ),
    },
    {
      key: "receipt",
      label: "Justificatif",
      render: (expense: FinancialExpense) => (
        expense.receiptUrl ? (
          <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            <Receipt className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (expense: FinancialExpense) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingExpenseId(expense.id);
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteExpenseId(expense.id)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  if (!isSuperAdmin) {
    return (
      <AdminPageLayout
        title="Dépenses"
        description="Gestion des dépenses réelles"
        icon={<Receipt className="w-5 h-5 text-cjd-green" />}
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Dépenses"
      description="Gestion des dépenses réelles"
      breadcrumbs={[
        { label: "Finances", path: "/admin/finance" },
        { label: "Dépenses" },
      ]}
      icon={<Receipt className="w-5 h-5 text-cjd-green" />}
      showHeader={false}
      showCard={false}
    >
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Total dépenses</div>
              <div className="text-2xl font-bold">{stats.totalExpenses}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Montant total</div>
              <div className="text-2xl font-bold text-red-600">{formatEuros(stats.totalAmount)}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Par catégorie</div>
              <div className="text-2xl font-bold">{stats.byCategory.length}</div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Année</Label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les années" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Budget</Label>
              <Select value={filterBudget} onValueChange={setFilterBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les budgets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>{budget.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle dépense
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        {expensesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <AdminDataTable
            data={filteredExpenses}
            columns={columns}
            searchable={true}
            searchPlaceholder="Rechercher une dépense..."
            getSearchValue={(expense) => expense.description}
          />
        )}

        {/* Dialog: Créer une dépense */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une dépense</DialogTitle>
              <DialogDescription>
                Enregistrez une nouvelle dépense réelle
              </DialogDescription>
            </DialogHeader>
            <AdminExpenseForm
              categories={categories}
              budgets={budgets}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              onUploadReceipt={handleUploadReceipt}
              isLoading={createExpenseMutation.isPending}
              isUploading={isUploading}
              mode="create"
            />
          </DialogContent>
        </Dialog>

        {/* Dialog: Modifier une dépense */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier la dépense</DialogTitle>
              <DialogDescription>
                Modifiez les informations de la dépense
              </DialogDescription>
            </DialogHeader>
            {editingExpense && (
              <AdminExpenseForm
                expense={editingExpense}
                categories={categories}
                budgets={budgets}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingExpenseId(null);
                }}
                onUploadReceipt={handleUploadReceipt}
                isLoading={updateExpenseMutation.isPending}
                isUploading={isUploading}
                mode="edit"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* AlertDialog: Supprimer une dépense */}
        <AlertDialog open={!!deleteExpenseId} onOpenChange={(open) => !open && setDeleteExpenseId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la dépense</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                {deleteExpenseMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminPageLayout>
  );
}




