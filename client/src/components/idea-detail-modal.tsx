import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lightbulb, User, Calendar, TrendingUp, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Idea } from "@shared/schema";
import { IDEA_STATUS } from "@shared/schema";

interface IdeaWithVotes extends Omit<Idea, "voteCount"> {
  voteCount: number;
}

interface IdeaDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: IdeaWithVotes | null;
}

export default function IdeaDetailModal({ open, onOpenChange, idea }: IdeaDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [votes, setVotes] = useState<any[]>([]);
  const [votesLoading, setVotesLoading] = useState(false);

  const updateIdeaStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/ideas/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'idée a été mis à jour",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/ideas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Idée supprimée",
        description: "L'idée a été définitivement supprimée",
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

  if (!idea) return null;

  const getIdeaStatusInfo = (status: string) => {
    switch (status) {
      case IDEA_STATUS.PENDING:
        return { label: "En attente", class: "bg-orange-100 text-orange-800" };
      case IDEA_STATUS.APPROVED:
        return { label: "Idée soumise au vote", class: "bg-green-100 text-green-800" };
      case IDEA_STATUS.REJECTED:
        return { label: "Rejetée", class: "bg-red-100 text-red-800" };
      case IDEA_STATUS.UNDER_REVIEW:
        return { label: "En cours d'étude", class: "bg-blue-100 text-blue-800" };
      case IDEA_STATUS.POSTPONED:
        return { label: "Reportée", class: "bg-gray-100 text-gray-800" };
      case IDEA_STATUS.COMPLETED:
        return { label: "Réalisée", class: "bg-purple-100 text-purple-800" };
      default:
        return { label: "Inconnu", class: "bg-gray-100 text-gray-800" };
    }
  };

  const handleStatusChange = (status: string) => {
    updateIdeaStatusMutation.mutate({ id: idea.id, status });
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement cette idée ?")) {
      deleteIdeaMutation.mutate(idea.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Charger les votes quand le modal s'ouvre
  useEffect(() => {
    if (open && idea) {
      setVotesLoading(true);
      fetch(`/api/admin/ideas/${idea.id}/votes`)
        .then(res => res.json())
        .then(data => {
          setVotes(data);
          setVotesLoading(false);
        })
        .catch(err => {
          console.error('Erreur chargement votes:', err);
          setVotesLoading(false);
        });
    }
  }, [open, idea]);



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="w-5 h-5 text-cjd-green" />
            Détails de l'idée
          </DialogTitle>
          <DialogDescription>
            Consultez et gérez les détails de cette idée proposée par les membres CJD
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-6">
            <Badge 
              className={getIdeaStatusInfo(idea.status).class}
            >
              {getIdeaStatusInfo(idea.status).label}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              {idea.voteCount} vote{idea.voteCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{idea.title}</h3>
          </div>

          {/* Description */}
          {idea.description && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {idea.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Proposée par</span>
              <span className="font-medium">{idea.proposedBy}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Le</span>
              <span className="font-medium">{formatDate(idea.createdAt.toString())}</span>
            </div>
          </div>

          <Separator />

          {/* Votes List */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Votants ({idea.voteCount})
            </h4>
            {votesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-cjd-green" />
              </div>
            ) : votes.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {votes.map((vote: any, index: number) => (
                    <div key={vote.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{index + 1}.</span>
                        <span className="font-medium">{vote.voterName}</span>
                        <span className="text-gray-500">({vote.voterEmail})</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(vote.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucun vote pour le moment</p>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Changer le statut</h4>
              <Select 
                value={idea.status} 
                onValueChange={handleStatusChange}
                disabled={updateIdeaStatusMutation.isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className={`inline-block px-3 py-1 text-sm rounded-full ${getIdeaStatusInfo(idea.status).class}`}>
                      {getIdeaStatusInfo(idea.status).label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IDEA_STATUS.PENDING}>En attente</SelectItem>
                  <SelectItem value={IDEA_STATUS.APPROVED}>Idée soumise au vote</SelectItem>
                  <SelectItem value={IDEA_STATUS.REJECTED}>Rejetée</SelectItem>
                  <SelectItem value={IDEA_STATUS.UNDER_REVIEW}>En cours d'étude</SelectItem>
                  <SelectItem value={IDEA_STATUS.POSTPONED}>Reportée</SelectItem>
                  <SelectItem value={IDEA_STATUS.COMPLETED}>Réalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={deleteIdeaMutation.isPending}
                className="w-full"
              >
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}