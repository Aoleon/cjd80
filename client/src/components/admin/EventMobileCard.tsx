import { Edit, Trash2, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateLong } from "@/lib/adminUtils";
import type { EventWithInscriptions } from "@/types/admin";

interface EventMobileCardProps {
  events: EventWithInscriptions[];
  onViewDetail: (event: EventWithInscriptions) => void;
  onEdit: (event: EventWithInscriptions) => void;
  onManageInscriptions: (event: EventWithInscriptions) => void;
  onExportInscriptions: (event: EventWithInscriptions) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export default function EventMobileCard({
  events,
  onViewDetail,
  onEdit,
  onManageInscriptions,
  onExportInscriptions,
  onDelete,
  isDeleting,
}: EventMobileCardProps) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="p-4">
          <div className="space-y-3">
            <button
              onClick={() => onViewDetail(event)}
              className="w-full text-left"
              data-testid={`button-view-event-mobile-${event.id}`}
            >
              <h4 className="font-semibold text-blue-600 hover:text-cjd-green transition-colors hover:underline">
                {event.title}
              </h4>
              {event.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {event.description}
                </p>
              )}
            </button>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <div className="text-gray-600">
                  {formatDateLong(event.date)}
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Lieu:</span>
                <div className="text-gray-600">
                  {event.location || <span className="text-gray-400">Non défini</span>}
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700">HelloAsso:</span>
                <div className="text-gray-600">
                  {event.helloAssoLink ? (
                    <a href={event.helloAssoLink} target="_blank" rel="noopener noreferrer" className="text-cjd-green hover:underline">
                      Lien actif →
                    </a>
                  ) : (
                    <span className="text-gray-400">Aucun lien</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700">Présents / Absents:</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onManageInscriptions(event)}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                  title="Gérer les inscriptions et absences"
                  data-testid={`button-manage-inscriptions-mobile-${event.id}`}
                >
                  <Users className="w-3 h-3 mr-1" />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-600 font-medium">{event.inscriptionCount} présents</span>
                    <span className="text-orange-600">{event.unsubscriptionCount} absents</span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(event)}
                  className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                  data-testid={`button-edit-event-mobile-${event.id}`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier l'événement
                </Button>
                
                {event.inscriptionCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onExportInscriptions(event)}
                    className="w-full text-green-600 border-green-300 hover:bg-green-50"
                    data-testid={`button-export-inscriptions-mobile-${event.id}`}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter les inscriptions ({event.inscriptionCount})
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(event.id)}
                  disabled={isDeleting}
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  data-testid={`button-delete-event-mobile-${event.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer l'événement
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
