"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useForm } from "react-hook-form";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminBudgetForm, { type BudgetFormValues } from "@/components/admin/AdminBudgetForm";
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
import { Loader2, Plus, Edit, Trash2, Euro, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FinancialBudget, FinancialCategory } from "@shared/schema";

const formatEuros = (cents: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
};

const getPeriodLabel = (period: string, month?: number | null, quarter?: number | null, year: number = new Date().getFullYear()): string => {
  if (period === "month" && month) {
    const monthName = new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long' });
    return `${monthName} ${year}`;
  } else if (period === "quarter" && quarter) {
    return `T${quarter} ${year}`;
  } else if (period === "year") {
    return `${year}`;
  }
  return period;
};

export default function AdminBudgetsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const isSuperAdmin = user?.role === "super_admin";

  // Queries
  const { data: budgetsResponse, isLoading: budgetsLoading } = useAdminQuery<{ success: boolean; data: FinancialBudget[] }>(
    ["/api/admin/finance/budgets", filterPeriod, filterYear, filterCategory],
    async () => {
      const params = new URLSearchParams();
      if (filterPeriod !== "all") params.append("period", filterPeriod);
      if (filterYear !== "all") params.append("year", filterYear);
      if (filterCategory !== "all") params.append("category", filterCategory);
      
      const res = await fetch(`/api/admin/finance/budgets?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch budgets');
      return res.json();
    },
    {
      enabled: isSuperAdmin,
      staleTime: 2 * 60 * 1000,
    }
  );

  const budgets = budgetsResponse?.data || [];

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

  const { data: statsResponse } = useAdminQuery<{ success: boolean; data: {
    totalBudgets: number;
    totalAmount: number;
    byCategory: { category: string; count: number; totalAmount: number }[];
    byPeriod: { period: string; count: number; totalAmount: number }[];
  } }>(
    ["/api/admin/finance/budgets/stats", filterYear],
    async () => {
      const params = new URLSearchParams();
      if (filterYear !== "all") params.append("year", filterYear);
      
      const res = await fetch(`/api/admin/finance/budgets/stats?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch budget stats');
      return res.json();
    },
    {
      enabled: isSuperAdmin,
      staleTime: 5 * 60 * 1000,
    }
  );

  const stats = statsResponse?.data;

  // Filtrage
  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      if (filterPeriod !== "all" && budget.period !== filterPeriod) return false;
      if (filterYear !== "all" && budget.year.toString() !== filterYear) return false;
      if (filterCategory !== "all" && budget.category !== filterCategory) return false;
      return true;
    });
  }, [budgets, filterPeriod, filterYear, filterCategory]);

  // Mutations
  const createBudgetMutation = useMutation({
    mutationFn: (data: BudgetFormValues) => {
      return apiRequest("POST", "/api/admin/finance/budgets", {
        ...data,
        createdBy: user?.email || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/budgets/stats"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Budget créé",
        description: "Le budget a été créé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création du budget.",
        variant: "destructive",
      });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetFormValues> }) => {
      return apiRequest("PUT", `/api/admin/finance/budgets/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/budgets/stats"] });
      setIsEditDialogOpen(false);
      setEditingBudgetId(null);
      toast({
        title: "Budget modifié",
        description: "Le budget a été modifié avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification du budget.",
        variant: "destructive",
      });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: string) => {
      return apiRequest("DELETE", `/api/admin/finance/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/budgets/stats"] });
      setDeleteBudgetId(null);
      toast({
        title: "Budget supprimé",
        description: "Le budget a été supprimé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression du budget.",
        variant: "destructive",
      });
    },
  });

  const editingBudget = editingBudgetId ? budgets.find(b => b.id === editingBudgetId) : null;

  const handleCreate = (data: BudgetFormValues) => {
    createBudgetMutation.mutate(data);
  };

  const handleUpdate = (data: BudgetFormValues) => {
    if (!editingBudgetId) return;
    updateBudgetMutation.mutate({ id: editingBudgetId, data });
  };

  const handleDelete = () => {
    if (!deleteBudgetId) return;
    deleteBudgetMutation.mutate(deleteBudgetId);
  };

  // Colonnes pour la table
  const columns = [
    {
      key: "name",
      label: "Nom",
      render: (budget: FinancialBudget) => (
        <div className="font-medium">{budget.name}</div>
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      render: (budget: FinancialBudget) => {
        const category = categories.find(c => c.id === budget.category);
        return <Badge variant="outline">{category?.name || budget.category}</Badge>;
      },
    },
    {
      key: "period",
      label: "Période",
      render: (budget: FinancialBudget) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{getPeriodLabel(budget.period, budget.month || null, budget.quarter || null, budget.year)}</span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Montant",
      render: (budget: FinancialBudget) => (
        <div className="flex items-center gap-2 font-semibold text-green-600">
          <Euro className="h-4 w-4" />
          <span>{formatEuros(budget.amountInCents)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (budget: FinancialBudget) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingBudgetId(budget.id);
              setIsEditDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteBudgetId(budget.id)}
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
        title="Budgets"
        description="Gestion des budgets prévisionnels"
        icon={<TrendingUp className="w-5 h-5 text-cjd-green" />}
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Budgets"
      description="Gestion des budgets prévisionnels"
      breadcrumbs={[
        { label: "Finances", path: "/admin/finance" },
        { label: "Budgets" },
      ]}
      icon={<TrendingUp className="w-5 h-5 text-cjd-green" />}
      showHeader={false}
      showCard={false}
    >
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Total budgets</div>
              <div className="text-2xl font-bold">{stats.totalBudgets}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">Montant total</div>
              <div className="text-2xl font-bold text-green-600">{formatEuros(stats.totalAmount)}</div>
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
              <Label>Période</Label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les périodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="month">Mensuel</SelectItem>
                  <SelectItem value="quarter">Trimestriel</SelectItem>
                  <SelectItem value="year">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau budget
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        {budgetsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <AdminDataTable
            data={filteredBudgets}
            columns={columns}
            searchable={true}
            searchPlaceholder="Rechercher un budget..."
            getSearchValue={(budget) => budget.name}
          />
        )}

        {/* Dialog: Créer un budget */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un budget</DialogTitle>
              <DialogDescription>
                Créez un nouveau budget prévisionnel
              </DialogDescription>
            </DialogHeader>
            <AdminBudgetForm
              categories={categories}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={createBudgetMutation.isPending}
              mode="create"
            />
          </DialogContent>
        </Dialog>

        {/* Dialog: Modifier un budget */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le budget</DialogTitle>
              <DialogDescription>
                Modifiez les informations du budget
              </DialogDescription>
            </DialogHeader>
            {editingBudget && (
              <AdminBudgetForm
                budget={editingBudget}
                categories={categories}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingBudgetId(null);
                }}
                isLoading={updateBudgetMutation.isPending}
                mode="edit"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* AlertDialog: Supprimer un budget */}
        <AlertDialog open={!!deleteBudgetId} onOpenChange={(open) => !open && setDeleteBudgetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le budget</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce budget ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                {deleteBudgetMutation.isPending ? (
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




