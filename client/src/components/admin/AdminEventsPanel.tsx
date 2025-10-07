import { Loader2, Calendar, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminEvents } from "@/hooks/useAdminEvents";
import EventTable from "./EventTable";
import EventMobileCard from "./EventMobileCard";
import type { EventWithInscriptions } from "@/types/admin";

interface AdminEventsPanelProps {
  enabled: boolean;
  onCreateEvent: () => void;
  onViewDetail: (event: EventWithInscriptions) => void;
  onEdit: (event: EventWithInscriptions) => void;
  onManageInscriptions: (event: EventWithInscriptions) => void;
  onExportInscriptions: (event: EventWithInscriptions) => void;
}

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
        <Button
          onClick={onCreateEvent}
          className="bg-cjd-green hover:bg-green-700 text-white w-full sm:w-auto"
          data-testid="button-create-event"
        >
          <CalendarPlus className="w-4 h-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : events && events.length > 0 ? (
        <>
          <div className="hidden lg:block">
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

          <div className="lg:hidden">
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
