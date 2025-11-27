import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Calendar, Users, Lightbulb, LogOut, Database, TrendingUp, Package, Wallet, BarChart3, Award, Receipt, TrendingDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import EventAdminModal from "./event-admin-modal";
import EventDetailModal from "./event-detail-modal";
import IdeaDetailModal from "./idea-detail-modal";
import EditIdeaModal from "./edit-idea-modal";
import LoanItemDetailModal from "./LoanItemDetailModal";
import EditLoanItemModal from "./EditLoanItemModal";
import InscriptionExportModal from "./inscription-export-modal";
import ManageInscriptionsModal from "./manage-inscriptions-modal";
import ManageVotesModal from "./manage-votes-modal";
import AdminLogin from "./admin-login";
import AdminManagement from "./admin-management";
import PendingAdminApproval from "./pending-admin-approval";
import DevelopmentRequestsSection from "./development-requests-section";
import AdminDashboardOverview from "./admin/AdminDashboardOverview";
import AdminIdeasPanel from "./admin/AdminIdeasPanel";
import AdminEventsPanel from "./admin/AdminEventsPanel";
import AdminLoanItemsPanel from "./admin/AdminLoanItemsPanel";
import type { IdeaWithVotes, EventWithInscriptions, AdminStats } from "@/types/admin";

interface AdminSectionProps {
  defaultTab?: string;
}

export default function AdminSection({ defaultTab = "dashboard" }: AdminSectionProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const { data: stats, isLoading: statsLoading } = useAdminQuery<{ success: boolean; data: AdminStats }>(
    ["/api/admin/stats"],
    async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return res.json();
    },
    {
      enabled: !!user && activeTab === "dashboard",
      staleTime: 2 * 60 * 1000, // 2 minutes pour les stats
    }
  );
  
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState<"create" | "edit">("create");
  const [selectedEvent, setSelectedEvent] = useState<EventWithInscriptions | null>(null);
  const [ideaDetailModalOpen, setIdeaDetailModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<IdeaWithVotes | null>(null);
  const [eventDetailModalOpen, setEventDetailModalOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventWithInscriptions | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [eventToExport, setEventToExport] = useState<EventWithInscriptions | null>(null);
  const [editIdeaModalOpen, setEditIdeaModalOpen] = useState(false);
  const [ideaToEdit, setIdeaToEdit] = useState<IdeaWithVotes | null>(null);
  const [manageInscriptionsModalOpen, setManageInscriptionsModalOpen] = useState(false);
  const [eventToManageInscriptions, setEventToManageInscriptions] = useState<EventWithInscriptions | null>(null);
  const [manageVotesModalOpen, setManageVotesModalOpen] = useState(false);
  const [ideaToManageVotes, setIdeaToManageVotes] = useState<IdeaWithVotes | null>(null);
  const [loanItemDetailModalOpen, setLoanItemDetailModalOpen] = useState(false);
  const [selectedLoanItem, setSelectedLoanItem] = useState<any | null>(null);
  const [editLoanItemModalOpen, setEditLoanItemModalOpen] = useState(false);
  const [loanItemToEdit, setLoanItemToEdit] = useState<any | null>(null);

  if (!user) return <AdminLogin />;

  return (
    <ErrorBoundary
      fallbackTitle="Erreur dans le panneau d'administration"
      fallbackMessage="Une erreur s'est produite dans le panneau d'administration. Veuillez réessayer ou retourner à l'accueil."
    >
      <section className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Administration</h2>
            <p className="text-sm sm:text-base text-gray-600">Bienvenue, {user.email}</p>
          </div>
          <Button onClick={() => logoutMutation.mutate()} variant="outline" className="text-gray-600 hover:text-gray-800 w-full sm:w-auto">
            <LogOut className="w-4 h-4 mr-2" />Se déconnecter
          </Button>
        </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`w-full grid ${user?.role === "super_admin" ? "grid-cols-7" : "grid-cols-5"}`}>
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tableau de bord</span>
              <span className="sm:hidden">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="ideas" className="text-xs sm:text-sm">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Gestion des idées</span>
              <span className="sm:hidden">Idées</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Gestion des événements</span>
              <span className="sm:hidden">Événements</span>
            </TabsTrigger>
            <TabsTrigger value="loan-items" className="text-xs sm:text-sm">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Gestion du prêt</span>
              <span className="sm:hidden">Prêt</span>
            </TabsTrigger>
            <TabsTrigger value="admins" className="text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Administrateurs</span>
              <span className="sm:hidden">Admins</span>
            </TabsTrigger>
            {user?.role === "super_admin" && (
              <>
                <TabsTrigger value="finance" className="text-xs sm:text-sm">
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Finances</span>
                  <span className="sm:hidden">Finance</span>
                </TabsTrigger>
                <TabsTrigger value="dev-requests" className="text-xs sm:text-sm">
                  <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Développement</span>
                  <span className="sm:hidden">Dev</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="p-3 sm:p-6">
            <AdminDashboardOverview
              stats={stats}
              isLoading={statsLoading}
              userRole={user?.role}
              onNavigate={setLocation}
              onTabChange={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="ideas" className="p-3 sm:p-6">
            <AdminIdeasPanel
              enabled={activeTab === "ideas"}
              onViewDetail={(idea) => { setSelectedIdea(idea); setIdeaDetailModalOpen(true); }}
              onManageVotes={(idea) => { setIdeaToManageVotes(idea); setManageVotesModalOpen(true); }}
              onEdit={(idea) => { setIdeaToEdit(idea); setEditIdeaModalOpen(true); }}
            />
          </TabsContent>

          <TabsContent value="events" className="p-3 sm:p-6">
            <AdminEventsPanel
              enabled={activeTab === "events"}
              onCreateEvent={() => { setEventModalMode("create"); setSelectedEvent(null); setEventModalOpen(true); }}
              onViewDetail={(event) => { setSelectedEventForDetail(event); setEventDetailModalOpen(true); }}
              onEdit={(event) => { setEventModalMode("edit"); setSelectedEvent(event); setEventModalOpen(true); }}
              onManageInscriptions={(event) => { setEventToManageInscriptions(event); setManageInscriptionsModalOpen(true); }}
              onExportInscriptions={(event) => { setEventToExport(event); setExportModalOpen(true); }}
            />
          </TabsContent>

          <TabsContent value="loan-items" className="p-3 sm:p-6">
            <AdminLoanItemsPanel
              enabled={activeTab === "loan-items"}
              onViewDetail={(item) => { setSelectedLoanItem(item); setLoanItemDetailModalOpen(true); }}
              onEdit={(item) => { setLoanItemToEdit(item); setEditLoanItemModalOpen(true); }}
            />
          </TabsContent>

          <TabsContent value="admins" className="p-3 sm:p-6">
            <div className="space-y-6">
              <PendingAdminApproval currentUser={user!} />
              <AdminManagement currentUser={user!} />
            </div>
          </TabsContent>

          {user?.role === "super_admin" && (
            <>
              <TabsContent value="finance" className="p-3 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pilotage Financier</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Accédez aux outils de gestion financière : budgets, dépenses, prévisions et rapports.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="h-auto flex-col items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setLocation("/admin/finance/dashboard")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-cjd-green" />
                          <span className="font-semibold">Tableau de bord</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 text-left">
                          Vue d'ensemble financière avec KPIs
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setLocation("/admin/finance/budgets")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="w-5 h-5 text-cjd-green" />
                          <span className="font-semibold">Budgets</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 text-left">
                          Gérer les budgets prévisionnels
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setLocation("/admin/finance/expenses")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Receipt className="w-5 h-5 text-cjd-green" />
                          <span className="font-semibold">Dépenses</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 text-left">
                          Suivre les dépenses réelles
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setLocation("/admin/finance/forecasts")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-5 h-5 text-cjd-green" />
                          <span className="font-semibold">Prévisions</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 text-left">
                          Prévisions de revenus
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setLocation("/admin/finance/reports")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-cjd-green" />
                          <span className="font-semibold">Rapports</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 text-left">
                          Générer des rapports financiers
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto flex-col items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setLocation("/admin/finance/sponsorships")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-cjd-green" />
                          <span className="font-semibold">Sponsorings</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 text-left">
                          Gérer les sponsorings
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="dev-requests" className="p-3 sm:p-6">
                <DevelopmentRequestsSection userRole={user.role} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </Card>

      <EventAdminModal open={eventModalOpen} onOpenChange={setEventModalOpen} event={selectedEvent} mode={eventModalMode} />
      <EventDetailModal 
        open={eventDetailModalOpen} 
        onOpenChange={setEventDetailModalOpen} 
        event={selectedEventForDetail}
        onEdit={(event) => { setSelectedEvent({...event, unsubscriptionCount: event.unsubscriptionCount || 0}); setEventModalMode("edit"); setEventModalOpen(true); }}
      />
      <IdeaDetailModal open={ideaDetailModalOpen} onOpenChange={setIdeaDetailModalOpen} idea={selectedIdea} />
      <EditIdeaModal open={editIdeaModalOpen} onOpenChange={setEditIdeaModalOpen} idea={ideaToEdit} />
      <LoanItemDetailModal 
        open={loanItemDetailModalOpen} 
        onOpenChange={setLoanItemDetailModalOpen} 
        item={selectedLoanItem}
        onEdit={(item) => { setLoanItemToEdit(item); setEditLoanItemModalOpen(true); }}
      />
      <EditLoanItemModal 
        open={editLoanItemModalOpen} 
        onOpenChange={setEditLoanItemModalOpen} 
        item={loanItemToEdit}
      />
      <InscriptionExportModal open={exportModalOpen} onOpenChange={setExportModalOpen} event={eventToExport} />
      <ManageInscriptionsModal open={manageInscriptionsModalOpen} onOpenChange={setManageInscriptionsModalOpen} event={eventToManageInscriptions} />
      <ManageVotesModal open={manageVotesModalOpen} onOpenChange={setManageVotesModalOpen} idea={ideaToManageVotes} />
      </section>
    </ErrorBoundary>
  );
}
