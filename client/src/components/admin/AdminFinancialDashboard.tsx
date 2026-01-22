"use client";

import { useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Euro, TrendingUp, TrendingDown, AlertCircle, Target, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

interface ExtendedFinancialKPIs {
  revenues: {
    actual: number;
    forecasted: number;
    variance: number;
    variancePercent: number;
  };
  expenses: {
    actual: number;
    budgeted: number;
    variance: number;
    variancePercent: number;
  };
  balance: {
    actual: number;
    forecasted: number;
    variance: number;
  };
  realizationRate: number;
}

const formatEuros = (cents: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
};

const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export default function AdminFinancialDashboard() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);

  const isSuperAdmin = user?.role === "super_admin";

  const { data: kpisResponse, isLoading, error } = useAdminQuery<{ success: boolean; data: ExtendedFinancialKPIs }>(
    ["/api/admin/finance/kpis/extended", selectedPeriod, selectedYear],
    async () => {
      const params = new URLSearchParams();
      if (selectedPeriod) params.append("period", selectedPeriod);
      if (selectedYear) params.append("year", selectedYear.toString());
      
      const res = await fetch(`/api/admin/finance/kpis/extended?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch extended financial KPIs');
      return res.json();
    },
    {
      enabled: isSuperAdmin,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const kpis = kpisResponse?.data;

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tableau de bord financier</CardTitle>
          <CardDescription>Vous n'avez pas les permissions nécessaires</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Erreur
          </CardTitle>
          <CardDescription>
            {error?.message || "Impossible de charger les KPIs financiers étendus"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Période</Label>
            <Select value={selectedPeriod || "all"} onValueChange={(value) => setSelectedPeriod(value === "all" ? undefined : value)}>
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
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPIs Revenus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Revenus réels</span>
              <Euro className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatEuros(kpis.revenues.actual)}</div>
            <div className="text-xs text-gray-500 mt-1">vs prévu: {formatEuros(kpis.revenues.forecasted)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Écart revenus</span>
              {kpis.revenues.variance >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.revenues.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatEuros(kpis.revenues.variance)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{formatPercent(kpis.revenues.variancePercent)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Dépenses réelles</span>
              <Euro className="h-5 w-5 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatEuros(kpis.expenses.actual)}</div>
            <div className="text-xs text-gray-500 mt-1">vs budgété: {formatEuros(kpis.expenses.budgeted)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Écart dépenses</span>
              {kpis.expenses.variance <= 0 ? (
                <TrendingDown className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.expenses.variance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatEuros(kpis.expenses.variance)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{formatPercent(kpis.expenses.variancePercent)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Solde et Taux de réalisation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Solde
            </CardTitle>
            <CardDescription>Résultat financier (Revenus - Dépenses)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Solde réel</div>
                <div className={`text-3xl font-bold ${kpis.balance.actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatEuros(kpis.balance.actual)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Solde prévu</div>
                <div className="text-xl text-gray-500">{formatEuros(kpis.balance.forecasted)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Écart</div>
                <div className={`text-lg font-semibold ${kpis.balance.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatEuros(kpis.balance.variance)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Taux de réalisation
            </CardTitle>
            <CardDescription>Pourcentage de réalisation des prévisions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Taux de réalisation</div>
                <div className={`text-3xl font-bold ${kpis.realizationRate >= 100 ? 'text-green-600' : kpis.realizationRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {kpis.realizationRate.toFixed(2)}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    kpis.realizationRate >= 100 ? 'bg-green-600' : 
                    kpis.realizationRate >= 80 ? 'bg-yellow-600' : 
                    'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(kpis.realizationRate, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {kpis.realizationRate >= 100 
                  ? "Objectif atteint ✓" 
                  : kpis.realizationRate >= 80 
                  ? "En bonne voie" 
                  : "Attention: objectif non atteint"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résumé des écarts */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé des écarts</CardTitle>
          <CardDescription>Comparaison réel vs prévu/budgété</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Revenus</div>
              <div className="text-lg font-semibold">
                Réel: {formatEuros(kpis.revenues.actual)}
              </div>
              <div className="text-sm text-gray-500">
                Prévu: {formatEuros(kpis.revenues.forecasted)}
              </div>
              <div className={`text-sm font-medium mt-2 ${kpis.revenues.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Écart: {formatEuros(kpis.revenues.variance)} ({formatPercent(kpis.revenues.variancePercent)})
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Dépenses</div>
              <div className="text-lg font-semibold">
                Réel: {formatEuros(kpis.expenses.actual)}
              </div>
              <div className="text-sm text-gray-500">
                Budgété: {formatEuros(kpis.expenses.budgeted)}
              </div>
              <div className={`text-sm font-medium mt-2 ${kpis.expenses.variance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Écart: {formatEuros(kpis.expenses.variance)} ({formatPercent(kpis.expenses.variancePercent)})
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Solde</div>
              <div className="text-lg font-semibold">
                Réel: {formatEuros(kpis.balance.actual)}
              </div>
              <div className="text-sm text-gray-500">
                Prévu: {formatEuros(kpis.balance.forecasted)}
              </div>
              <div className={`text-sm font-medium mt-2 ${kpis.balance.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Écart: {formatEuros(kpis.balance.variance)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




