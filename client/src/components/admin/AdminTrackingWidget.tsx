import { useQuery } from "@tanstack/react-query";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Activity, TrendingUp, Users, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission } from "@shared/schema";

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

interface AdminTrackingWidgetProps {
  userRole?: string;
}

export default function AdminTrackingWidget({ userRole }: AdminTrackingWidgetProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const hasViewPermission = user && hasPermission(user.role, 'admin.view');
  
  const { data: trackingData, isLoading, error } = useAdminQuery<TrackingDashboard>(
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

  if (!hasViewPermission) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cjd-green" />
            Suivi Transversal
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
            <Activity className="h-5 w-5 text-cjd-green" />
            Suivi Transversal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            <AlertCircle className="h-8 w-8 text-error" />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Erreur de chargement du suivi transversal
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trackingData) {
    return null;
  }

  const data = trackingData;

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setLocation("/admin/tracking")}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-cjd-green" />
          Suivi Transversal
        </CardTitle>
        <CardDescription>Métriques de conversion et d'engagement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Membres */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cjd-green" />
              <span className="font-semibold">Membres</span>
            </div>
            <Badge variant="secondary">{data.members.total}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500">Actifs</div>
              <div className="text-lg font-bold text-success">{data.members.active}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Proposés</div>
              <div className="text-lg font-bold text-warning">{data.members.proposed}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Haut potentiel</div>
              <div className="text-lg font-bold text-info">{data.members.highPotential}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Inactifs</div>
              <div className="text-lg font-bold text-error">{data.members.stale}</div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Taux de conversion</span>
              <Badge className="bg-success text-white">
                {data.conversionRate.members}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Mécènes */}
        {userRole === "super_admin" && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-cjd-green" />
                  <span className="font-semibold">Mécènes</span>
                </div>
                <Badge variant="secondary">{data.patrons.total}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Actifs</div>
                  <div className="text-lg font-bold text-success">{data.patrons.active}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Proposés</div>
                  <div className="text-lg font-bold text-warning">{data.patrons.proposed}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Haut potentiel</div>
                  <div className="text-lg font-bold text-info">{data.patrons.highPotential}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Inactifs</div>
                  <div className="text-lg font-bold text-error">{data.patrons.stale}</div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Taux de conversion</span>
                  <Badge className="bg-success text-white">
                    {data.conversionRate.patrons}%
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="pt-2 border-t text-center">
          <span className="text-xs text-gray-500">Cliquez pour voir le détail</span>
        </div>
      </CardContent>
    </Card>
  );
}

