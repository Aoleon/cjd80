"use client";

import { useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

interface FinancialComparison {
  revenues: { period1: number; period2: number; change: number; changePercent: number };
  expenses: { period1: number; period2: number; change: number; changePercent: number };
  balance: { period1: number; period2: number; change: number; changePercent: number };
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

export default function AdminComparisonWidget() {
  const { user } = useAuth();
  const [period1, setPeriod1] = useState<string>("month");
  const [year1, setYear1] = useState<number>(new Date().getFullYear() - 1);
  const [period2, setPeriod2] = useState<string>("month");
  const [year2, setYear2] = useState<number>(new Date().getFullYear());
  const [isComparing, setIsComparing] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";

  const { data: comparisonResponse, isLoading, error, refetch } = useAdminQuery<{ success: boolean; data: FinancialComparison }>(
    ["/api/admin/finance/comparison", period1, year1, period2, year2],
    async () => {
      const params = new URLSearchParams();
      params.append("period1", period1);
      params.append("year1", year1.toString());
      params.append("period2", period2);
      params.append("year2", year2.toString());
      
      const res = await fetch(`/api/admin/finance/comparison?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch financial comparison');
      return res.json();
    },
    {
      enabled: isSuperAdmin && isComparing,
      staleTime: 5 * 60 * 1000,
    }
  );

  const comparison = comparisonResponse?.data;

  const handleCompare = () => {
    setIsComparing(true);
    refetch();
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison financière</CardTitle>
        <CardDescription>Comparez deux périodes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélection des périodes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Période 1</Label>
            <div className="space-y-2">
              <Select value={period1} onValueChange={setPeriod1}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mensuel</SelectItem>
                  <SelectItem value="quarter">Trimestriel</SelectItem>
                  <SelectItem value="year">Annuel</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="2000"
                max="2100"
                value={year1}
                onChange={(e) => setYear1(parseInt(e.target.value) || new Date().getFullYear())}
                placeholder="Année"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Période 2</Label>
            <div className="space-y-2">
              <Select value={period2} onValueChange={setPeriod2}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mensuel</SelectItem>
                  <SelectItem value="quarter">Trimestriel</SelectItem>
                  <SelectItem value="year">Annuel</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="2000"
                max="2100"
                value={year2}
                onChange={(e) => setYear2(parseInt(e.target.value) || new Date().getFullYear())}
                placeholder="Année"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleCompare} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            "Comparer"
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error.message}
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {comparison && (
          <div className="space-y-4 pt-4 border-t">
            {/* Revenus */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-3">Revenus</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Période 1</div>
                  <div className="text-lg font-semibold">{formatEuros(comparison.revenues.period1)}</div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Période 2</div>
                  <div className="text-lg font-semibold">{formatEuros(comparison.revenues.period2)}</div>
                </div>
              </div>
              <div className={`mt-2 text-sm font-medium ${comparison.revenues.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.revenues.change >= 0 ? (
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="inline h-4 w-4 mr-1" />
                )}
                {formatEuros(comparison.revenues.change)} ({formatPercent(comparison.revenues.changePercent)})
              </div>
            </div>

            {/* Dépenses */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-3">Dépenses</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Période 1</div>
                  <div className="text-lg font-semibold">{formatEuros(comparison.expenses.period1)}</div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Période 2</div>
                  <div className="text-lg font-semibold">{formatEuros(comparison.expenses.period2)}</div>
                </div>
              </div>
              <div className={`mt-2 text-sm font-medium ${comparison.expenses.change <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.expenses.change <= 0 ? (
                  <TrendingDown className="inline h-4 w-4 mr-1" />
                ) : (
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                )}
                {formatEuros(comparison.expenses.change)} ({formatPercent(comparison.expenses.changePercent)})
              </div>
            </div>

            {/* Solde */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-3">Solde</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Période 1</div>
                  <div className={`text-lg font-semibold ${comparison.balance.period1 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatEuros(comparison.balance.period1)}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Période 2</div>
                  <div className={`text-lg font-semibold ${comparison.balance.period2 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatEuros(comparison.balance.period2)}
                  </div>
                </div>
              </div>
              <div className={`mt-2 text-sm font-medium ${comparison.balance.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {comparison.balance.change >= 0 ? (
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="inline h-4 w-4 mr-1" />
                )}
                {formatEuros(comparison.balance.change)} ({formatPercent(comparison.balance.changePercent)})
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}




