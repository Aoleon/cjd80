import { Loader2, Calendar, Users, Lightbulb, UserCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { getShortAppName } from '@/config/branding';

interface AdminStats {
  members: { total: number; active: number; proposed: number; recentActivity: number };
  patrons: { total: number; active: number; proposed: number };
  ideas: { total: number; pending: number; approved: number };
  events: { total: number; upcoming: number };
}

interface AdminDashboardOverviewProps {
  stats: { success: boolean; data: AdminStats } | undefined;
  isLoading: boolean;
  userRole: string | undefined;
  onNavigate: (path: string) => void;
  onTabChange: (tab: string) => void;
}

export default function AdminDashboardOverview({ 
  stats, 
  isLoading, 
  userRole,
  onNavigate,
  onTabChange 
}: AdminDashboardOverviewProps) {
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tableau de bord</h3>
        <p className="text-gray-600 dark:text-gray-400">Vue d'ensemble de la plateforme {getShortAppName()}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : stats?.data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => onNavigate('/admin/members')} 
              data-testid="card-members"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
                  <span>Membres</span>
                  <UserCircle className="h-5 w-5 text-cjd-green" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.data.members.total}</div>
                <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Actifs:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{stats.data.members.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Propositions:</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">{stats.data.members.proposed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actifs (30j):</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.data.members.recentActivity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {userRole === "super_admin" && (
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => onNavigate('/admin/patrons')} 
                data-testid="card-patrons"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
                    <span>Mécènes</span>
                    <Users className="h-5 w-5 text-cjd-green" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.data.patrons.total}</div>
                  <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Actifs:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{stats.data.patrons.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Propositions:</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">{stats.data.patrons.proposed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="hover:shadow-lg transition-shadow" data-testid="card-ideas">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
                  <span>Idées</span>
                  <Lightbulb className="h-5 w-5 text-cjd-green" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.data.ideas.total}</div>
                <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>En attente:</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">{stats.data.ideas.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approuvées:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{stats.data.ideas.approved}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow" data-testid="card-events">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-between">
                  <span>Événements</span>
                  <Calendar className="h-5 w-5 text-cjd-green" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.data.events.total}</div>
                <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>À venir:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.data.events.upcoming}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions rapides</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => onNavigate('/admin/members')}
                data-testid="button-manage-members"
              >
                <UserCircle className="h-6 w-6 text-cjd-green" />
                <span className="font-medium">Gérer les membres</span>
                {stats.data.members.proposed > 0 && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    {stats.data.members.proposed} proposition{stats.data.members.proposed > 1 ? 's' : ''} en attente
                  </span>
                )}
              </Button>

              {userRole === "super_admin" && (
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => onNavigate('/admin/patrons')}
                  data-testid="button-manage-patrons"
                >
                  <Users className="h-6 w-6 text-cjd-green" />
                  <span className="font-medium">Gérer les mécènes</span>
                  {stats.data.patrons.proposed > 0 && (
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      {stats.data.patrons.proposed} proposition{stats.data.patrons.proposed > 1 ? 's' : ''} en attente
                    </span>
                  )}
                </Button>
              )}

              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => onTabChange('ideas')}
                data-testid="button-manage-ideas"
              >
                <Lightbulb className="h-6 w-6 text-cjd-green" />
                <span className="font-medium">Gérer les idées</span>
                {stats.data.ideas.pending > 0 && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    {stats.data.ideas.pending} en attente de validation
                  </span>
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="text-red-600">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Impossible de charger les statistiques
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Une erreur s'est produite lors de la récupération des données.
              </p>
            </div>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] })}
              variant="outline"
              data-testid="button-retry-stats"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
