import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Users, Edit, Trash2, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event, Inscription } from "@shared/schema";

interface EventWithInscriptions extends Omit<Event, "inscriptionCount"> {
  inscriptionCount: number;
}

interface EventDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventWithInscriptions | null;
  onEdit?: (event: EventWithInscriptions) => void;
}

export default function EventDetailModal({ 
  open, 
  onOpenChange, 
  event, 
  onEdit 
}: EventDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInscriptions, setShowInscriptions] = useState(false);

  // Fetch inscriptions for this event
  const { data: inscriptions, isLoading: inscriptionsLoading } = useQuery<Inscription[]>({
    queryKey: [`/api/admin/events/${event?.id}/inscriptions`],
    enabled: !!event && showInscriptions,
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Événement supprimé",
        description: "L'événement a été définitivement supprimé",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de suppression",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!event) return null;

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = new Date(event.date) > new Date();

  const handleEdit = () => {
    if (onEdit) {
      onEdit(event);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.")) {
      deleteEventMutation.mutate(event.id);
    }
  };

  const exportInscriptions = () => {
    if (!inscriptions) return;
    
    const csvContent = [
      "Email,Nom,Commentaire,Date d'inscription",
      ...inscriptions.map(inscription => 
        `"${inscription.email}","${inscription.name || ''}","${inscription.comments || ''}","${new Date(inscription.createdAt).toLocaleDateString('fr-FR')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inscriptions-${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-cjd-green" />
            Détails de l'événement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Badge variant={isUpcoming ? "default" : "secondary"} className="text-sm">
              {isUpcoming ? "📅 À venir" : "✅ Terminé"}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {event.inscriptionCount} inscription{event.inscriptionCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Date et heure</p>
                <p className="text-gray-600">{formatDate(event.date)}</p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Lieu</p>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {event.description}
              </p>
            </div>
          )}

          {/* HelloAsso Link */}
          {event.helloAssoLink && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Lien d'inscription</h4>
              <a 
                href={event.helloAssoLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cjd-green hover:text-cjd-green-dark transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir HelloAsso
              </a>
            </div>
          )}

          <Separator />

          {/* Inscriptions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-700">
                Inscriptions ({event.inscriptionCount})
              </h4>
              <div className="flex gap-2">
                {inscriptions && inscriptions.length > 0 && (
                  <Button
                    onClick={exportInscriptions}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Exporter CSV
                  </Button>
                )}
                <Button
                  onClick={() => setShowInscriptions(!showInscriptions)}
                  variant="outline"
                  size="sm"
                >
                  {showInscriptions ? "Masquer" : "Afficher"}
                </Button>
              </div>
            </div>

            {showInscriptions && (
              <div className="border rounded-lg">
                {inscriptionsLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-cjd-green border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : inscriptions && inscriptions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Commentaire</TableHead>
                          <TableHead>Date d'inscription</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inscriptions.map((inscription) => (
                          <TableRow key={inscription.id}>
                            <TableCell className="font-medium">
                              {inscription.email}
                            </TableCell>
                            <TableCell>
                              {inscription.name || "-"}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={inscription.comments || ""}>
                                {inscription.comments || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(inscription.createdAt).toLocaleDateString("fr-FR")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Aucune inscription pour cet événement
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleEdit}
              className="bg-cjd-green hover:bg-cjd-green-dark text-white flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier l'événement
            </Button>
            
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={deleteEventMutation.isPending}
              className="sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}