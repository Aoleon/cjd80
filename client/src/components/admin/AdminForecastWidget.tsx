import { useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle, Sparkles, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import type { FinancialForecast } from "@shared/schema";

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

export default function AdminForecastWidget() {
  const { user } = useAuth();
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  const isSuperAdmin = user?.role === "super_admin";

  const { data: forecastsResponse, isLoading, error } = useAdminQuery<{ success: boolean; data: FinancialForecast[] }>(
    ["/api/admin/finance/forecasts", filterPeriod, filterYear],
    async () => {
      const params = new URLSearchParams();
      if (filterPeriod !== "all") params.append("period", filterPeriod);
      params.append("year", filterYear.toString());
      
      const res = await fetch(`/api/admin/finance/forecasts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch forecasts');
      return res.json();
    },
    {
      enabled: isSuperAdmin,
      staleTime: 5 * 60 * 1000,
    }
  );

  const forecasts = forecastsResponse?.data || [];

  if (!isSuperAdmin) {
    return null;
  }

  const totalForecasted = forecasts.reduce((sum, f) => sum + f.forecastedAmountInCents, 0);
  const avgConfidence = forecasts.length > 0
    ? forecasts.reduce((sum, f) => {
        const confValue = f.confidence === 'high' ? 3 : f.confidence === 'medium' ? 2 : 1;
        return sum + confValue;
      }, 0) / forecasts.length
    : 0;
  const overallConfidence = avgConfidence >= 2.5 ? 'high' : avgConfidence >= 1.5 ? 'medium' : 'low';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Prévisions
        </CardTitle>
        <CardDescription>Prévisions de revenus pour la période sélectionnée</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Période</Label>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger>
                <SelectValue />
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
            <Select value={filterYear.toString()} onValueChange={(value) => setFilterYear(parseInt(value))}>
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

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error.message}
          </div>
        ) : (
          <>
            {/* Résumé */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Total prévu</div>
              <div className="text-2xl font-bold text-blue-600">{formatEuros(totalForecasted)}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Confiance globale:</span>
                <Badge variant={getConfidenceBadgeVariant(overallConfidence)}>
                  {getConfidenceLabel(overallConfidence)}
                </Badge>
              </div>
            </div>

            {/* Liste des prévisions */}
            {forecasts.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {forecasts.map((forecast) => (
                  <div key={forecast.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {getPeriodLabel(forecast.period, forecast.month || null, forecast.quarter || null, forecast.year)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatEuros(forecast.forecastedAmountInCents)}
                      </div>
                    </div>
                    <Badge variant={getConfidenceBadgeVariant(forecast.confidence)}>
                      {getConfidenceLabel(forecast.confidence)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                Aucune prévision disponible pour cette période
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}




