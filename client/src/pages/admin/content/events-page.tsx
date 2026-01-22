"use client";

import { useState } from "react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminEventsPanel from "@/components/admin/AdminEventsPanel";
import EventAdminModal from "@/components/event-admin-modal";
import EventDetailModal from "@/components/event-detail-modal";
import InscriptionExportModal from "@/components/inscription-export-modal";
import ManageInscriptionsModal from "@/components/manage-inscriptions-modal";
import FeatureGuard from "@/components/FeatureGuard";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Calendar } from "lucide-react";
import { getShortAppName } from '@/config/branding';
import type { EventWithInscriptions } from "@/types/admin";

export default function AdminEventsPage() {
  const { user, isLoading } = useAuth();
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState<"create" | "edit">("create");
  const [selectedEvent, setSelectedEvent] = useState<EventWithInscriptions | null>(null);
  const [eventDetailModalOpen, setEventDetailModalOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventWithInscriptions | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [eventToExport, setEventToExport] = useState<EventWithInscriptions | null>(null);
  const [manageInscriptionsModalOpen, setManageInscriptionsModalOpen] = useState(false);
  const [eventToManageInscriptions, setEventToManageInscriptions] = useState<EventWithInscriptions | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-cjd-green text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold">{getShortAppName()}</h1>
                <p className="text-white/90">Administration - Boîte à Kiffs</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Veuillez vous connecter pour accéder à l'administration.</p>
        </main>
      </div>
    );
  }

  return (
    <FeatureGuard featureKey="events" featureName="La gestion des événements">
      <AdminPageLayout
        title="Gestion des Événements"
        description="Gérer les événements et inscriptions"
        breadcrumbs={[
          { label: "Contenu", path: "/admin/content" },
          { label: "Événements" },
        ]}
        icon={<Calendar className="w-5 h-5 text-cjd-green" />}
        showCard={false}
      >
        <AdminEventsPanel
          enabled={true}
          onCreateEvent={() => { setEventModalMode("create"); setSelectedEvent(null); setEventModalOpen(true); }}
          onViewDetail={(event) => { setSelectedEventForDetail(event); setEventDetailModalOpen(true); }}
          onEdit={(event) => { setEventModalMode("edit"); setSelectedEvent(event); setEventModalOpen(true); }}
          onManageInscriptions={(event) => { setEventToManageInscriptions(event); setManageInscriptionsModalOpen(true); }}
          onExportInscriptions={(event) => { setEventToExport(event); setExportModalOpen(true); }}
        />
        
        <EventAdminModal 
          open={eventModalOpen} 
          onOpenChange={setEventModalOpen} 
          mode={eventModalMode}
          event={selectedEvent}
        />
        <EventDetailModal 
          open={eventDetailModalOpen} 
          onOpenChange={setEventDetailModalOpen} 
          event={selectedEventForDetail}
          onEdit={(event) => { setSelectedEvent({...event, unsubscriptionCount: event.unsubscriptionCount || 0}); setEventModalMode("edit"); setEventModalOpen(true); }}
        />
        <InscriptionExportModal open={exportModalOpen} onOpenChange={setExportModalOpen} event={eventToExport} />
        <ManageInscriptionsModal open={manageInscriptionsModalOpen} onOpenChange={setManageInscriptionsModalOpen} event={eventToManageInscriptions} />
      </AdminPageLayout>
    </FeatureGuard>
  );
}

