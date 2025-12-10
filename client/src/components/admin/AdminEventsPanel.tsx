import { Loader2, Calendar, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminEvents } from "@/hooks/useAdminEvents";
import EventTable from "./EventTable";
import EventMobileCard from "./EventMobileCard";
import { ExportButton } from "@/components/ui/export-button";
import type { EventWithInscriptions } from "@/types/admin";
import type { ExportColumn } from "@/lib/export-utils";

interface AdminEventsPanelProps {
  enabled: boolean;
  onCreateEvent: () => void;
  onViewDetail: (event: EventWithInscriptions) => void;
  onEdit: (event: EventWithInscriptions) => void;
  onManageInscriptions: (event: EventWithInscriptions) => void;
  onExportInscriptions: (event: EventWithInscriptions) => void;
}

// Colonnes pour l'export des événements
const exportColumns: ExportColumn[] = [
  { header: 'Titre', accessor: 'title' },
  { header: 'Description', accessor: 'description', format: (v) => v || '' },
  { header: 'Date', accessor: 'date', format: (v) => v ? new Date(v).toLocaleDateString('fr-FR') : '' },
  { header: 'Lieu', accessor: 'location', format: (v) => v || '' },
  { header: 'Places max', accessor: 'maxParticipants', format: (v) => v ? String(v) : 'Illimité' },
  { header: 'Inscrits', accessor: 'inscriptionCount', format: (v) => String(v) },
  { header: 'Désinscrits', accessor: 'unsubscriptionCount', format: (v) => String(v) },
  { header: 'Statut', accessor: 'status' },
  { header: 'Date création', accessor: 'createdAt', format: (v) => v ? new Date(v).toLocaleDateString('fr-FR') : '' },
];

export default function AdminEventsPanel({
  enabled,
  onCreateEvent,
  onViewDetail,
  onEdit,
  onManageInscriptions,
  onExportInscriptions,
}: AdminEventsPanelProps) {
  const {
    events,
    isLoading,
    deleteEvent,
    isDeleting,
  } = useAdminEvents(enabled);

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      deleteEvent(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-base sm:text-lg font-semibold">Tous les événements</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          {events && events.length > 0 && (
            <ExportButton
              filename="evenements-cjd"
              title="Liste des Événements CJD"
              columns={exportColumns}
              getData={() => events || []}
              size="sm"
              variant="outline"
            />
          )}
          <Button
            onClick={onCreateEvent}
            className="bg-cjd-green hover:bg-cjd-green-dark text-white flex-1 sm:flex-initial"
            data-testid="button-create-event"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Nouvel événement
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : events && events.length > 0 ? (
        <>
          <div className="hidden md:block">
            <EventTable
              events={events}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onManageInscriptions={onManageInscriptions}
              onExportInscriptions={onExportInscriptions}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </div>

          <div className="md:hidden">
            <EventMobileCard
              events={events}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onManageInscriptions={onManageInscriptions}
              onExportInscriptions={onExportInscriptions}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun événement</h3>
          <p className="text-gray-500">Les événements apparaîtront ici une fois créés</p>
        </div>
      )}
    </div>
  );
}
