import { useQuery } from "@tanstack/react-query";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Euro, TrendingUp, TrendingDown, Users, Activity, AlertCircle, Target, BarChart3 } from "lucide-react";
import { formatEuros } from "@/lib/reports";

interface FinancialKPIs {
  subscriptions: {
    totalRevenue: number;
    activeSubscriptions: number;
    totalSubscriptions: number;
    averageAmount: number;
    monthlyRevenue: number;
  };
  sponsorships: {
    totalRevenue: number;
    activeSponsorships: number;
    totalSponsorships: number;
    averageAmount: number;
    byLevel: { level: string; count: number; totalAmount: number }[];
  };
  totalRevenue: number;
}

interface EngagementKPIs {
  members: {
    total: number;
    active: number;
    averageScore: number;
    conversionRate: number;
    retentionRate: number;
    churnRate: number;
  };
  patrons: {
    total: number;
    active: number;
    conversionRate: number;
  };
  activities: {
    total: number;
    averagePerMember: number;
    byType: { type: string; count: number }[];
  };
}

interface AdminKPIsWidgetsProps {
  userRole?: string;
}

export function FinancialKPIsWidget({ userRole }: AdminKPIsWidgetsProps) {
  const { data: kpisResponse, isLoading, error } = useAdminQuery<{ success: boolean; data: FinancialKPIs }>(
    ["/api/admin/kpis/financial"],
    async () => {
      const res = await fetch("/api/admin/kpis/financial");
      if (!res.ok) throw new Error('Failed to fetch financial KPIs');
      return res.json();
    },
    {
      enabled: userRole === "super_admin",
      staleTime: 5 * 60 * 1000, // 5 minutes pour les KPIs financiers
    }
  );

  if (userRole !== "super_admin") {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-cjd-green" />
            KPIs Financiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-cjd-green" />
            KPIs Financiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            <AlertCircle className="h-8 w-8 text-error" />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Erreur de chargement des KPIs financiers
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!kpisResponse?.data) {
    return null;
  }

  const kpis = kpisResponse.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5 text-cjd-green" />
          KPIs Financiers
        </CardTitle>
        <CardDescription>Revenus et finances de l'association</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenus totaux */}
        <div>
          <div className="text-3xl font-bold text-cjd-green mb-2">
            {formatEuros(kpis.totalRevenue)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Revenus totaux</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Souscriptions */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Souscriptions</div>
            <div className="text-2xl font-bold">{formatEuros(kpis.subscriptions.totalRevenue)}</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Actives:</span>
                <span className="font-semibold">{kpis.subscriptions.activeSubscriptions}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">{kpis.subscriptions.totalSubscriptions}</span>
              </div>
              <div className="flex justify-between">
                <span>Moyenne:</span>
                <span className="font-semibold">{formatEuros(kpis.subscriptions.averageAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>30j:</span>
                <span className="font-semibold text-success">{formatEuros(kpis.subscriptions.monthlyRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Sponsorings */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Sponsorings</div>
            <div className="text-2xl font-bold">{formatEuros(kpis.sponsorships.totalRevenue)}</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Actifs:</span>
                <span className="font-semibold">{kpis.sponsorships.activeSponsorships}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">{kpis.sponsorships.totalSponsorships}</span>
              </div>
              <div className="flex justify-between">
                <span>Moyenne:</span>
                <span className="font-semibold">{formatEuros(kpis.sponsorships.averageAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsorings par niveau */}
        {kpis.sponsorships.byLevel.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Par niveau</div>
            <div className="space-y-1">
              {kpis.sponsorships.byLevel.map((level) => (
                <div key={level.level} className="flex justify-between items-center text-xs">
                  <span className="capitalize">{level.level}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{level.count}</Badge>
                    <span className="font-semibold">{formatEuros(level.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function EngagementKPIsWidget({ userRole }: AdminKPIsWidgetsProps) {
  const { data: kpisResponse, isLoading, error } = useAdminQuery<{ success: boolean; data: EngagementKPIs }>(
    ["/api/admin/kpis/engagement"],
    async () => {
      const res = await fetch("/api/admin/kpis/engagement");
      if (!res.ok) throw new Error('Failed to fetch engagement KPIs');
      return res.json();
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes pour les KPIs d'engagement
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cjd-green" />
            KPIs d'Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cjd-green" />
            KPIs d'Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            <AlertCircle className="h-8 w-8 text-error" />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Erreur de chargement des KPIs d'engagement
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!kpisResponse?.data) {
    return null;
  }

  const kpis = kpisResponse.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cjd-green" />
          KPIs d'Engagement
        </CardTitle>
        <CardDescription>Métriques d'engagement et de conversion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Membres */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cjd-green" />
            <span className="font-semibold">Membres</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500">Score moyen</div>
              <div className="text-lg font-bold">{kpis.members.averageScore}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Conversion</div>
              <div className="text-lg font-bold text-success">{kpis.members.conversionRate}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Rétention</div>
              <div className="text-lg font-bold text-info">{kpis.members.retentionRate}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Churn</div>
              <div className="text-lg font-bold text-warning">{kpis.members.churnRate}%</div>
            </div>
          </div>
        </div>

        {/* Mécènes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cjd-green" />
            <span className="font-semibold">Mécènes</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-bold">{kpis.patrons.total}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Conversion</div>
              <div className="text-lg font-bold text-success">{kpis.patrons.conversionRate}%</div>
            </div>
          </div>
        </div>

        {/* Activités */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cjd-green" />
            <span className="font-semibold">Activités</span>
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">{kpis.activities.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Moyenne par membre</span>
              <span className="font-bold">{kpis.activities.averagePerMember}</span>
            </div>
            {kpis.activities.byType.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="text-xs font-medium text-gray-500 mb-1">Par type</div>
                {kpis.activities.byType.map((type) => (
                  <div key={type.type} className="flex justify-between items-center text-xs">
                    <span className="capitalize">{type.type.replace('_', ' ')}</span>
                    <Badge variant="secondary">{type.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

export function ExtendedFinancialKPIsWidget({ userRole }: AdminKPIsWidgetsProps) {
  const { data: kpisResponse, isLoading, error } = useAdminQuery<{ success: boolean; data: ExtendedFinancialKPIs }>(
    ["/api/admin/finance/kpis/extended"],
    async () => {
      const res = await fetch("/api/admin/finance/kpis/extended");
      if (!res.ok) throw new Error('Failed to fetch extended financial KPIs');
      return res.json();
    },
    {
      enabled: userRole === "super_admin",
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (userRole !== "super_admin") {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cjd-green" />
            KPIs Financiers Étendus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cjd-green" />
            KPIs Financiers Étendus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            <AlertCircle className="h-8 w-8 text-error" />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Erreur de chargement des KPIs financiers étendus
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!kpisResponse?.data) {
    return null;
  }

  const kpis = kpisResponse.data;

  const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cjd-green" />
          KPIs Financiers Étendus
        </CardTitle>
        <CardDescription>Réel vs prévu/budgété avec écarts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenus */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</div>
          <div className="text-2xl font-bold text-green-600">{formatEuros(kpis.revenues.actual)}</div>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Prévu:</span>
              <span className="font-semibold">{formatEuros(kpis.revenues.forecasted)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Écart:</span>
              <div className="flex items-center gap-1">
                {kpis.revenues.variance >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`font-semibold ${kpis.revenues.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatEuros(kpis.revenues.variance)} ({formatPercent(kpis.revenues.variancePercent)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dépenses */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépenses</div>
          <div className="text-2xl font-bold text-red-600">{formatEuros(kpis.expenses.actual)}</div>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Budgété:</span>
              <span className="font-semibold">{formatEuros(kpis.expenses.budgeted)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Écart:</span>
              <div className="flex items-center gap-1">
                {kpis.expenses.variance <= 0 ? (
                  <TrendingDown className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingUp className="h-3 w-3 text-red-600" />
                )}
                <span className={`font-semibold ${kpis.expenses.variance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatEuros(kpis.expenses.variance)} ({formatPercent(kpis.expenses.variancePercent)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Solde */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde</div>
          <div className={`text-2xl font-bold ${kpis.balance.actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatEuros(kpis.balance.actual)}
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Prévu:</span>
              <span className="font-semibold">{formatEuros(kpis.balance.forecasted)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Écart:</span>
              <div className="flex items-center gap-1">
                {kpis.balance.variance >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`font-semibold ${kpis.balance.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatEuros(kpis.balance.variance)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Taux de réalisation */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-cjd-green" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de réalisation</span>
          </div>
          <div className={`text-2xl font-bold ${kpis.realizationRate >= 100 ? 'text-green-600' : kpis.realizationRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
            {kpis.realizationRate.toFixed(2)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                kpis.realizationRate >= 100 ? 'bg-green-600' : 
                kpis.realizationRate >= 80 ? 'bg-yellow-600' : 
                'bg-red-600'
              }`}
              style={{ width: `${Math.min(kpis.realizationRate, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

