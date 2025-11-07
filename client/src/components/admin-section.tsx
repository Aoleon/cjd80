import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Calendar, Users, Lightbulb, LogOut, Database, TrendingUp, Package } from "lucide-react";
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

export default function AdminSection() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const { data: stats, isLoading: statsLoading } = useQuery<{ success: boolean; data: AdminStats }>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && activeTab === "dashboard",
  });
  
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
          <TabsList className={`w-full grid ${user?.role === "super_admin" ? "grid-cols-6" : "grid-cols-5"}`}>
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
              <TabsTrigger value="dev-requests" className="text-xs sm:text-sm">
                <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Développement</span>
                <span className="sm:hidden">Dev</span>
              </TabsTrigger>
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

          <TabsContent value="admins" className="p-3 sm:p-6">
            <div className="space-y-6">
              <PendingAdminApproval currentUser={user!} />
              <AdminManagement currentUser={user!} />
            </div>
          </TabsContent>

          {user?.role === "super_admin" && (
            <TabsContent value="dev-requests" className="p-3 sm:p-6">
              <DevelopmentRequestsSection userRole={user.role} />
            </TabsContent>
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
