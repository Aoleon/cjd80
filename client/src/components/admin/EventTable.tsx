"use client";

import { Edit, Trash2, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatDateLong } from "@/lib/adminUtils";
import type { EventWithInscriptions } from "@/types/admin";

interface EventTableProps {
  events: EventWithInscriptions[];
  onViewDetail: (event: EventWithInscriptions) => void;
  onEdit: (event: EventWithInscriptions) => void;
  onManageInscriptions: (event: EventWithInscriptions) => void;
  onExportInscriptions: (event: EventWithInscriptions) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export default function EventTable({
  events,
  onViewDetail,
  onEdit,
  onManageInscriptions,
  onExportInscriptions,
  onDelete,
  isDeleting,
}: EventTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Lieu</TableHead>
            <TableHead>HelloAsso</TableHead>
            <TableHead className="text-center">Présents / Absents</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium max-w-xs">
                <div>
                  <button
                    onClick={() => onViewDetail(event)}
                    className="font-semibold text-left hover:text-cjd-green transition-colors cursor-pointer text-info hover:underline"
                    data-testid={`button-view-event-${event.id}`}
                  >
                    {event.title}
                  </button>
                  {event.description && (
                    <div className="text-sm text-gray-500 truncate">
                      {event.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {new Date(event.date).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {event.location || <span className="text-gray-400">Non défini</span>}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {event.helloAssoLink ? (
                  <a href={event.helloAssoLink} target="_blank" rel="noopener noreferrer" className="text-cjd-green hover:underline">
                    Lien actif
                  </a>
                ) : (
                  <span className="text-gray-400">Aucun lien</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onManageInscriptions(event)}
                  className="text-info hover:text-info-dark hover:bg-info-light"
                  title="Gérer les inscriptions et absences"
                  data-testid={`button-manage-inscriptions-${event.id}`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  <div className="flex flex-col items-center text-xs">
                    <span className="text-success font-medium">{event.inscriptionCount} présents</span>
                    <span className="text-warning">{event.unsubscriptionCount} absents</span>
                  </div>
                </Button>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(event)}
                    className="text-info border-info hover:bg-info-light"
                    title="Modifier l'événement"
                    data-testid={`button-edit-event-${event.id}`}
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  {event.inscriptionCount > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onExportInscriptions(event)}
                      className="text-success border-success hover:bg-success-light"
                      title="Exporter les inscriptions"
                      data-testid={`button-export-inscriptions-${event.id}`}
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(event.id)}
                    disabled={isDeleting}
                    className="text-error border-error hover:bg-error-light"
                    title="Supprimer l'événement"
                    data-testid={`button-delete-event-${event.id}`}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
