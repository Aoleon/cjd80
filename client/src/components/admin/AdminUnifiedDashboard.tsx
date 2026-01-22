"use client";

import { useAdminQuery } from "@/hooks/use-admin-query";
import AdminDashboardOverview from "./AdminDashboardOverview";
import { FinancialKPIsWidget, EngagementKPIsWidget, ExtendedFinancialKPIsWidget } from "./AdminKPIsWidgets";
import AdminTrackingWidget from "./AdminTrackingWidget";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission } from "@shared/schema";
import { Loader2, AlertCircle } from "lucide-react";
import type { AdminStats } from "@/types/admin";
import { Separator } from "@/components/ui/separator";

interface TrackingDashboard {
  members: {
    total: number;
    proposed: number;
    active: number;
    highPotential: number;
    stale: number;
  };
  patrons: {
    total: number;
    proposed: number;
    active: number;
    highPotential: number;
    stale: number;
  };
  conversionRate: {
    members: number;
    patrons: number;
  };
}

export default function AdminUnifiedDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const hasViewPermission = user && hasPermission(user.role, 'admin.view');
  
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminQuery<{ success: boolean; data: AdminStats }>(
    ["/api/admin/stats"],
    async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return res.json();
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes pour les stats
    }
  );

  // Récupérer les métriques de tracking si permissions
  const { data: trackingData, isLoading: trackingLoading, error: trackingError } = useAdminQuery<TrackingDashboard>(
    ["/api/tracking/dashboard"],
    async () => {
      const res = await fetch("/api/tracking/dashboard");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${res.status}: Impossible de charger le dashboard tracking`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Erreur lors du chargement du dashboard tracking');
      }
      return json.data;
    },
    {
      refetchInterval: 60000, // Refetch every minute
      staleTime: 30 * 1000, // 30 secondes pour le dashboard
    }
  );

  if (statsLoading || trackingLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  // Gestion des erreurs
  if (statsError || trackingError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-error" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {statsError?.message || trackingError?.message || "Impossible de charger les données du dashboard"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview (statistiques de base) */}
      <AdminDashboardOverview
        stats={stats}
        isLoading={statsLoading}
        userRole={user?.role}
        onNavigate={router.push}
        onTabChange={(tab) => {
          // Navigation vers les pages modulaires selon l'onglet
          const tabRoutes: Record<string, string> = {
            ideas: "/admin/content/ideas",
            events: "/admin/content/events",
            "loan-items": "/admin/content/loans",
          };
          const route = tabRoutes[tab];
          if (route) {
            router.push(route);
          }
        }}
      />

      <Separator />

      {/* KPIs Avancés */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FinancialKPIsWidget userRole={user?.role} />
        <EngagementKPIsWidget userRole={user?.role} />
        <AdminTrackingWidget userRole={user?.role} />
      </div>

      {/* KPIs Financiers Étendus (super_admin uniquement) */}
      {user?.role === "super_admin" && (
        <>
          <Separator />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExtendedFinancialKPIsWidget userRole={user?.role} />
          </div>
        </>
      )}
    </div>
  );
}

