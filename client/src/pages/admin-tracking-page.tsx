import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminHeader from "@/components/admin-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  TrendingUp,
  Users,
  Heart,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  RefreshCw,
  Eye,
  EyeOff,
  X,
  Download,
  Filter,
  Calendar,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
  recentActivity: Array<{
    id: string;
    entityType: string;
    entityEmail: string;
    metricType: string;
    description: string | null;
    recordedAt: string;
  }>;
  conversionRate: {
    members: number;
    patrons: number;
  };
  engagementTrends: Array<{
    date: string;
    members: number;
    patrons: number;
  }>;
}

interface TrackingAlert {
  id: string;
  entityType: 'member' | 'patron';
  entityId: string;
  entityEmail: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export default function AdminTrackingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'alerts'>('dashboard');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [alertFilters, setAlertFilters] = useState<{
    severity?: string;
    entityType?: string;
    isRead?: boolean;
  }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const hasViewPermission = user && hasPermission(user.role, 'admin.view');
  const hasManagePermission = user && hasPermission(user.role, 'admin.manage');

  // Dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard, error: dashboardError } = useQuery<TrackingDashboard>({
    queryKey: ["/api/tracking/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/tracking/dashboard");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${res.status}: Impossible de charger le dashboard`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Erreur lors du chargement du dashboard');
      }
      return json.data;
    },
    enabled: !!hasViewPermission,
    refetchInterval: 60000, // Refetch every minute
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  // Alerts data with filters
  const alertsQueryParams = new URLSearchParams();
  alertsQueryParams.append('isResolved', 'false');
  alertsQueryParams.append('limit', '100');
  if (alertFilters.severity) alertsQueryParams.append('severity', alertFilters.severity);
  if (alertFilters.entityType) alertsQueryParams.append('entityType', alertFilters.entityType);
  if (alertFilters.isRead !== undefined) alertsQueryParams.append('isRead', alertFilters.isRead.toString());
  
  const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts, error: alertsError } = useQuery<{ data: TrackingAlert[] }>({
    queryKey: ["/api/tracking/alerts", alertFilters],
    queryFn: async () => {
      const res = await fetch(`/api/tracking/alerts?${alertsQueryParams.toString()}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${res.status}: Impossible de charger les alertes`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Erreur lors du chargement des alertes');
      }
      return json;
    },
    enabled: !!hasViewPermission,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  const alerts = alertsData?.data || [];

  // Generate alerts mutation
  const generateAlertsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/tracking/alerts/generate", {});
    },
    onSuccess: (data: any) => {
      toast({
        title: "Alertes générées",
        description: data.message || "Les alertes ont été générées avec succès.",
      });
      refetchAlerts();
      refetchDashboard();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer les alertes",
        variant: "destructive",
      });
    },
  });

  // Update alert mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({ alertId, data }: { alertId: string; data: { isRead?: boolean; isResolved?: boolean } }) => {
      return await apiRequest("PUT", `/api/tracking/alerts/${alertId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracking/alerts"] });
      refetchAlerts();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'alerte",
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' && !a.isResolved).length;
  
  // Filter alerts by search query and filters (optimized with useMemo)
  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    
    return alerts.filter((alert: TrackingAlert) => {
      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          alert.title.toLowerCase().includes(query) ||
          alert.message.toLowerCase().includes(query) ||
          alert.entityEmail.toLowerCase().includes(query) ||
          alert.entityId.toLowerCase().includes(query) ||
          alert.alertType.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Filtre par sévérité
      if (alertFilters.severity && alert.severity !== alertFilters.severity) {
        return false;
      }
      
      // Filtre par type d'entité
      if (alertFilters.entityType && alert.entityType !== alertFilters.entityType) {
        return false;
      }
      
      // Filtre par statut de lecture
      if (alertFilters.isRead !== undefined && alert.isRead !== alertFilters.isRead) {
        return false;
      }
      
      return true;
    });
  }, [alerts, searchQuery, alertFilters]);

  // Statistiques des alertes filtrées
  const filteredAlertsStats = useMemo(() => {
    if (!filteredAlerts) return { total: 0, unread: 0, critical: 0, high: 0 };
    
    return {
      total: filteredAlerts.length,
      unread: filteredAlerts.filter(a => !a.isRead).length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      high: filteredAlerts.filter(a => a.severity === 'high').length,
    };
  }, [filteredAlerts]);
  
  // Export functions
  const exportMetrics = useCallback(async () => {
    try {
      // Validation des dates
      if (dateRange.start && dateRange.end) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        if (start > end) {
          toast({
            title: "Erreur de validation",
            description: "La date de début doit être antérieure à la date de fin",
            variant: "destructive",
          });
          return;
        }
        // Vérifier que la plage ne dépasse pas 1 an
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 365) {
          toast({
            title: "Plage trop large",
            description: "Veuillez sélectionner une plage de dates inférieure à 1 an",
            variant: "destructive",
          });
          return;
        }
      }
      
      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);
      
      const res = await fetch(`/api/tracking/metrics?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${res.status}: Impossible de récupérer les métriques`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Erreur lors de la récupération des métriques');
      }
      const metrics = json.data || [];
      
      if (metrics.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucune métrique trouvée pour la plage de dates sélectionnée",
          variant: "default",
        });
        return;
      }
      
      // Convert to CSV
      const headers = ['Date', 'Type', 'Entité', 'Email', 'Type métrique', 'Valeur', 'Description', 'Enregistré par'];
      const rows = metrics.map((m: any) => [
        format(new Date(m.recordedAt), 'yyyy-MM-dd HH:mm:ss', { locale: fr }),
        m.entityType === 'member' ? 'Membre' : 'Mécène',
        m.entityId,
        m.entityEmail,
        m.metricType,
        m.metricValue,
        m.description || '',
        m.recordedBy || '',
      ]);
      
      const csv = [headers.join(','), ...rows.map((r: any[]) => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tracking-metrics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      
      toast({
        title: "Export réussi",
        description: `${metrics.length} métriques exportées`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'export",
        description: error.message || "Impossible d'exporter les métriques",
        variant: "destructive",
      });
    }
  }, [dateRange, toast]);
  
  const exportAlerts = useCallback(() => {
    try {
      if (filteredAlerts.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucune alerte à exporter avec les filtres actuels",
          variant: "default",
        });
        return;
      }
      
      const headers = ['Date', 'Type', 'Entité', 'Email', 'Type alerte', 'Sévérité', 'Titre', 'Message', 'Statut'];
      const rows = filteredAlerts.map((a) => [
        format(new Date(a.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: fr }),
        a.entityType === 'member' ? 'Membre' : 'Mécène',
        a.entityId,
        a.entityEmail,
        a.alertType,
        a.severity,
        a.title,
        a.message,
        a.isResolved ? 'Résolu' : a.isRead ? 'Lu' : 'Non lu',
      ]);
      
      const csv = [headers.join(','), ...rows.map((r) => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tracking-alerts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      
      toast({
        title: "Export réussi",
        description: `${filteredAlerts.length} alertes exportées`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'export",
        description: error.message || "Impossible d'exporter les alertes",
        variant: "destructive",
      });
    }
  }, [filteredAlerts, toast]);

  // Raccourcis clavier pour améliorer l'UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K : Rafraîchir les données
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        refetchDashboard();
        refetchAlerts();
        toast({
          title: "Actualisation",
          description: "Les données ont été rafraîchies",
        });
      }
      
      // Ctrl/Cmd + E : Exporter (selon l'onglet actif)
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (selectedTab === 'dashboard') {
          exportMetrics();
        } else {
          exportAlerts();
        }
      }
      
      // Ctrl/Cmd + G : Générer les alertes (uniquement dans l'onglet alertes)
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && selectedTab === 'alerts') {
        e.preventDefault();
        if (!generateAlertsMutation.isPending) {
          generateAlertsMutation.mutate();
        }
      }
      
      // Échap : Réinitialiser les filtres
      if (e.key === 'Escape' && (searchQuery || alertFilters.severity || alertFilters.entityType || alertFilters.isRead !== undefined)) {
        setSearchQuery('');
        setAlertFilters({
          severity: undefined,
          entityType: undefined,
          isRead: undefined,
        });
        toast({
          title: "Filtres réinitialisés",
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTab, searchQuery, alertFilters, exportMetrics, exportAlerts, toast, refetchDashboard, refetchAlerts, generateAlertsMutation]);

  if (!hasViewPermission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivi Transversal</h1>
              <p className="text-gray-600">Tableau de bord de suivi des membres potentiels et mécènes</p>
            </div>
            {dashboardData && !dashboardLoading && (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Actualisation automatique toutes les minutes</span>
              </div>
            )}
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'dashboard' | 'alerts')} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="dashboard" className="relative">
                Dashboard
                {dashboardLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </TabsTrigger>
              <TabsTrigger value="alerts" className="relative">
                Alertes
                {unreadAlertsCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadAlertsCount}
                  </Badge>
                )}
                {criticalAlertsCount > 0 && (
                  <span className="ml-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </TabsTrigger>
            </TabsList>
            {selectedTab === 'dashboard' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="text-sm border rounded px-2 py-1"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="text-sm border rounded px-2 py-1"
                  />
                </div>
                <Button onClick={exportMetrics} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter métriques
                </Button>
              </div>
            )}
            {selectedTab === 'alerts' && (
              <Button onClick={exportAlerts} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter alertes
              </Button>
            )}
          </div>

          <TabsContent value="dashboard" className="space-y-4">
            {dashboardError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Erreur de chargement</p>
                      <p className="text-sm text-red-700">{dashboardError instanceof Error ? dashboardError.message : 'Une erreur est survenue lors du chargement du dashboard'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchDashboard()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {dashboardLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : dashboardData ? (
              <>
                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Membres */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Membres
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.members.total}</div>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Actifs:</span>
                          <span className="font-medium text-green-600">{dashboardData.members.active}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Proposés:</span>
                          <span className="font-medium text-blue-600">{dashboardData.members.proposed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Haut potentiel:</span>
                          <span className="font-medium text-purple-600">{dashboardData.members.highPotential}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inactifs:</span>
                          <span className="font-medium text-orange-600">{dashboardData.members.stale}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mécènes */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Mécènes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.patrons.total}</div>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Actifs:</span>
                          <span className="font-medium text-green-600">{dashboardData.patrons.active}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Proposés:</span>
                          <span className="font-medium text-blue-600">{dashboardData.patrons.proposed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Haut potentiel:</span>
                          <span className="font-medium text-purple-600">{dashboardData.patrons.highPotential}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inactifs:</span>
                          <span className="font-medium text-orange-600">{dashboardData.patrons.stale}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Taux de conversion */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Taux de conversion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Membres</span>
                            <span className={`font-medium ${dashboardData.conversionRate.members >= 50 ? 'text-green-600' : dashboardData.conversionRate.members >= 25 ? 'text-yellow-600' : 'text-orange-600'}`}>
                              {dashboardData.conversionRate.members.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                dashboardData.conversionRate.members >= 50 ? 'bg-green-600' :
                                dashboardData.conversionRate.members >= 25 ? 'bg-yellow-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min(dashboardData.conversionRate.members, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Mécènes</span>
                            <span className={`font-medium ${dashboardData.conversionRate.patrons >= 50 ? 'text-green-600' : dashboardData.conversionRate.patrons >= 25 ? 'text-yellow-600' : 'text-orange-600'}`}>
                              {dashboardData.conversionRate.patrons.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                dashboardData.conversionRate.patrons >= 50 ? 'bg-purple-600' :
                                dashboardData.conversionRate.patrons >= 25 ? 'bg-purple-500' : 'bg-purple-400'
                              }`}
                              style={{ width: `${Math.min(dashboardData.conversionRate.patrons, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="pt-2 border-t text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Excellent:</span>
                            <span className="text-green-600">≥50%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bon:</span>
                            <span className="text-yellow-600">25-49%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>À améliorer:</span>
                            <span className="text-orange-600">&lt;25%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alertes actives */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Alertes actives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{alerts.length}</div>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span>Non lues:</span>
                          <span className="font-medium text-red-600">{unreadAlertsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Critiques:</span>
                          <span className="font-medium text-red-600">{criticalAlertsCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Graphique de tendances */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tendances d'engagement (7 derniers jours)</CardTitle>
                    <CardDescription>Activité des membres et mécènes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {dashboardData.engagementTrends.map((trend, index) => {
                        const maxValue = Math.max(
                          ...dashboardData.engagementTrends.map(t => Math.max(t.members, t.patrons)),
                          1 // Éviter division par zéro
                        );
                        const totalDay = trend.members + trend.patrons;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="w-full flex gap-1 items-end justify-center relative" style={{ height: '200px' }}>
                              <div
                                className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                                style={{
                                  height: `${(trend.members / maxValue) * 100}%`,
                                  minHeight: trend.members > 0 ? '4px' : '0',
                                }}
                                title={`Membres: ${trend.members} activité(s)`}
                              />
                              <div
                                className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors cursor-pointer"
                                style={{
                                  height: `${(trend.patrons / maxValue) * 100}%`,
                                  minHeight: trend.patrons > 0 ? '4px' : '0',
                                }}
                                title={`Mécènes: ${trend.patrons} activité(s)`}
                              />
                              {/* Tooltip au survol */}
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {format(new Date(trend.date), 'EEEE d MMMM', { locale: fr })}<br />
                                Total: {totalDay} activité{totalDay > 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2 font-medium">
                              {format(new Date(trend.date), 'dd/MM', { locale: fr })}
                            </div>
                            <div className="text-xs text-gray-400">
                              {totalDay}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded" />
                        <span className="text-sm text-gray-600">Membres</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded" />
                        <span className="text-sm text-gray-600">Mécènes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activité récente */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activité récente</CardTitle>
                    <CardDescription>Dernières métriques enregistrées</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {dashboardData.recentActivity.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">Aucune activité récente</p>
                        ) : (
                          dashboardData.recentActivity.map((activity) => {
                            const getMetricTypeLabel = (type: string) => {
                              const labels: Record<string, string> = {
                                'status_change': 'Changement de statut',
                                'conversion': 'Conversion',
                                'engagement': 'Engagement',
                                'activity': 'Activité',
                              };
                              return labels[type] || type;
                            };
                            
                            const getMetricTypeColor = (type: string) => {
                              if (type === 'conversion') return 'text-green-600 bg-green-50';
                              if (type === 'status_change') return 'text-blue-600 bg-blue-50';
                              return 'text-gray-600 bg-gray-50';
                            };
                            
                            return (
                              <div
                                key={activity.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`p-2 rounded ${getMetricTypeColor(activity.metricType)}`}>
                                    <Activity className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {activity.entityType === 'member' ? 'Membre' : 'Mécène'}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {getMetricTypeLabel(activity.metricType)}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {activity.description || activity.metricType}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {activity.entityEmail}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                  {formatDistanceToNow(new Date(activity.recordedAt), { addSuffix: true, locale: fr })}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Alertes de suivi</h2>
                <p className="text-sm text-gray-500">Alertes automatiques et manuelles</p>
              </div>
              <div className="flex items-center gap-2">
                {hasManagePermission && (
                  <Button
                    onClick={() => generateAlertsMutation.mutate()}
                    disabled={generateAlertsMutation.isPending}
                    variant="outline"
                    title="Générer les alertes automatiquement (Ctrl/Cmd + G)"
                    aria-label="Générer les alertes"
                  >
                    {generateAlertsMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Générer les alertes
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  onClick={exportAlerts} 
                  variant="outline"
                  title="Exporter les alertes filtrées en CSV (Ctrl/Cmd + E)"
                  aria-label="Exporter les alertes"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter ({filteredAlertsStats.total})
                </Button>
              </div>
            </div>
            
            {/* Statistiques des alertes filtrées */}
            {filteredAlertsStats.total !== alerts.length && (
              <div className="flex items-center gap-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <span>
                  Affichage de <strong>{filteredAlertsStats.total}</strong> alerte{filteredAlertsStats.total > 1 ? 's' : ''} sur {alerts.length}
                </span>
                {filteredAlertsStats.unread > 0 && (
                  <span className="text-red-600">
                    • {filteredAlertsStats.unread} non lue{filteredAlertsStats.unread > 1 ? 's' : ''}
                  </span>
                )}
                {filteredAlertsStats.critical > 0 && (
                  <span className="text-red-600 font-semibold">
                    • {filteredAlertsStats.critical} critique{filteredAlertsStats.critical > 1 ? 's' : ''}
                  </span>
                )}
                {filteredAlertsStats.high > 0 && (
                  <span className="text-orange-600">
                    • {filteredAlertsStats.high} élevée{filteredAlertsStats.high > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
            
            {/* Filtres et recherche */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher dans les alertes... (Échap pour réinitialiser)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-8 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Rechercher dans les alertes"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Effacer la recherche"
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <select
                    value={alertFilters.severity || ''}
                    onChange={(e) => setAlertFilters({ ...alertFilters, severity: e.target.value || undefined })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">Toutes les sévérités</option>
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="critical">Critique</option>
                  </select>
                  <select
                    value={alertFilters.entityType || ''}
                    onChange={(e) => setAlertFilters({ ...alertFilters, entityType: e.target.value || undefined })}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">Tous les types</option>
                    <option value="member">Membres</option>
                    <option value="patron">Mécènes</option>
                  </select>
                  <select
                    value={alertFilters.isRead === undefined ? '' : alertFilters.isRead ? 'read' : 'unread'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAlertFilters({
                        ...alertFilters,
                        isRead: value === '' ? undefined : value === 'read',
                      });
                    }}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="read">Lues</option>
                    <option value="unread">Non lues</option>
                  </select>
                  {(alertFilters.severity || alertFilters.entityType || alertFilters.isRead !== undefined || searchQuery) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAlertFilters({});
                        setSearchQuery('');
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Réinitialiser
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {alertsError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Erreur de chargement</p>
                      <p className="text-sm text-red-700">{alertsError instanceof Error ? alertsError.message : 'Une erreur est survenue lors du chargement des alertes'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchAlerts()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {alertsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {alerts.length === 0 ? 'Aucune alerte active' : 'Aucune alerte ne correspond aux filtres'}
                  </p>
                  {alerts.length > 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      {alerts.length} alerte{alerts.length > 1 ? 's' : ''} au total
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredAlerts.length !== alerts.length && (
                  <div className="text-sm text-gray-500 mb-2">
                    Affichage de {filteredAlerts.length} sur {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
                  </div>
                )}
                {filteredAlerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={alert.isRead ? 'opacity-75' : ''}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`h-3 w-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                            <Badge variant={getSeverityBadge(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">
                              {alert.entityType === 'member' ? 'Membre' : 'Mécène'}
                            </Badge>
                            <Badge variant="outline">
                              {alert.alertType}
                            </Badge>
                            {!alert.isRead && (
                              <Badge variant="secondary" className="animate-pulse">
                                Non lu
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold mb-1">{alert.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{alert.entityEmail}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: fr })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!alert.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateAlertMutation.mutate({ alertId: alert.id, data: { isRead: true } })}
                              title="Marquer comme lu"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {alert.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateAlertMutation.mutate({ alertId: alert.id, data: { isRead: false } })}
                              title="Marquer comme non lu"
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}
                          {hasManagePermission && !alert.isResolved && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateAlertMutation.mutate({ alertId: alert.id, data: { isResolved: true } })}
                              title="Résoudre"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

