"use client";

import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAdminQuery } from "@/hooks/use-admin-query";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminDataTable from "@/components/admin/AdminDataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, TrendingUp, Sparkles, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FinancialForecast, FinancialCategory } from "@shared/schema";
import { FINANCIAL_PERIOD, FORECAST_CONFIDENCE, FORECAST_BASED_ON } from "@shared/schema";

const formatEuros = (cents: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
};

const getConfidenceLabel = (confidence: string): string => {
  const labels: Record<string, string> = {
    high: "Élevée",
    medium: "Moyenne",
    low: "Faible",
  };
  return labels[confidence] || confidence;
};

const getConfidenceBadgeVariant = (confidence: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    high: "default",
    medium: "secondary",
    low: "outline",
  };
  return variants[confidence] || "default";
};

const getBasedOnLabel = (basedOn: string): string => {
  const labels: Record<string, string> = {
    historical: "Historique",
    estimate: "Estimation",
  };
  return labels[basedOn] || basedOn;
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

export default function AdminForecastsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generatePeriod, setGeneratePeriod] = useState<string>("month");
  const [generateYear, setGenerateYear] = useState<number>(new Date().getFullYear());
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const isSuperAdmin = user?.role === "super_admin";

  // Queries
  const { data: forecastsResponse, isLoading: forecastsLoading } = useAdminQuery<{ success: boolean; data: FinancialForecast[] }>(
    ["/api/admin/finance/forecasts", filterPeriod, filterYear, filterCategory],
    async () => {
      const params = new URLSearchParams();
      if (filterPeriod !== "all") params.append("period", filterPeriod);
      if (filterYear !== "all") params.append("year", filterYear);
      if (filterCategory !== "all") params.append("category", filterCategory);
      
      const res = await fetch(`/api/admin/finance/forecasts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch forecasts');
      return res.json();
    },
    {
      enabled: isSuperAdmin,
      staleTime: 2 * 60 * 1000,
    }
  );

  const forecasts = forecastsResponse?.data || [];

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
  const incomeCategories = categories.filter(c => c.type === "income");

  // Mutations
  const generateForecastsMutation = useMutation({
    mutationFn: ({ period, year }: { period: string; year: number }) => {
      return apiRequest("POST", "/api/admin/finance/forecasts/generate", { period, year });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/finance/forecasts"] });
      setIsGenerateDialogOpen(false);
      toast({
        title: "Prévisions générées",
        description: "Les prévisions ont été générées avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la génération des prévisions.",
        variant: "destructive",
      });
    },
  });

  // Filtrage
  const filteredForecasts = useMemo(() => {
    return forecasts.filter((forecast) => {
      if (filterPeriod !== "all" && forecast.period !== filterPeriod) return false;
      if (filterYear !== "all" && forecast.year.toString() !== filterYear) return false;
      if (filterCategory !== "all" && forecast.category !== filterCategory) return false;
      return true;
    });
  }, [forecasts, filterPeriod, filterYear, filterCategory]);

  const handleGenerate = () => {
    generateForecastsMutation.mutate({ period: generatePeriod, year: generateYear });
  };

  // Colonnes pour la table
  const columns = [
    {
      key: "category",
      label: "Catégorie",
      render: (forecast: FinancialForecast) => {
        const category = categories.find(c => c.id === forecast.category);
        return <Badge variant="outline">{category?.name || forecast.category}</Badge>;
      },
    },
    {
      key: "period",
      label: "Période",
      render: (forecast: FinancialForecast) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{getPeriodLabel(forecast.period, forecast.month || null, forecast.quarter || null, forecast.year)}</span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Montant prévu",
      render: (forecast: FinancialForecast) => (
        <div className="flex items-center gap-2 font-semibold text-blue-600">
          <TrendingUp className="h-4 w-4" />
          <span>{formatEuros(forecast.forecastedAmountInCents)}</span>
        </div>
      ),
    },
    {
      key: "confidence",
      label: "Confiance",
      render: (forecast: FinancialForecast) => (
        <Badge variant={getConfidenceBadgeVariant(forecast.confidence)}>
          {getConfidenceLabel(forecast.confidence)}
        </Badge>
      ),
    },
    {
      key: "basedOn",
      label: "Basé sur",
      render: (forecast: FinancialForecast) => (
        <Badge variant="outline">
          {getBasedOnLabel(forecast.basedOn)}
        </Badge>
      ),
    },
  ];

  if (!isSuperAdmin) {
    return (
      <AdminPageLayout
        title="Prévisions"
        description="Gestion des prévisions de revenus"
        icon={<Sparkles className="w-5 h-5 text-cjd-green" />}
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Prévisions"
      description="Gestion des prévisions de revenus"
      breadcrumbs={[
        { label: "Finances", path: "/admin/finance" },
        { label: "Prévisions" },
      ]}
      icon={<Sparkles className="w-5 h-5 text-cjd-green" />}
      showHeader={false}
      showCard={false}
    >
      <div className="space-y-6">
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
                  {incomeCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => setIsGenerateDialogOpen(true)} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Générer automatiquement
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        {forecastsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <AdminDataTable
            data={filteredForecasts}
            columns={columns}
            searchable={true}
            searchPlaceholder="Rechercher une prévision..."
            getSearchValue={(forecast) => {
              const category = categories.find(c => c.id === forecast.category);
              return category?.name || "";
            }}
          />
        )}

        {/* Dialog: Générer des prévisions */}
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Générer des prévisions automatiquement</DialogTitle>
              <DialogDescription>
                Générer des prévisions basées sur les données historiques
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Période</Label>
                <Select value={generatePeriod} onValueChange={setGeneratePeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mensuel</SelectItem>
                    <SelectItem value="quarter">Trimestriel</SelectItem>
                    <SelectItem value="year">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Année</Label>
                <Input
                  type="number"
                  min="2000"
                  max="2100"
                  value={generateYear}
                  onChange={(e) => setGenerateYear(parseInt(e.target.value) || new Date().getFullYear())}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleGenerate} disabled={generateForecastsMutation.isPending}>
                  {generateForecastsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Générer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPageLayout>
  );
}




