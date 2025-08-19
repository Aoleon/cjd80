import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Lightbulb, User, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Idea } from "@shared/schema";

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

  const approveIdeaMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      await apiRequest("PATCH", `/api/admin/ideas/${id}`, { approved });
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: approved ? "Idée approuvée" : "Idée refusée",
        description: approved 
          ? "L'idée est maintenant visible par tous les utilisateurs"
          : "L'idée a été refusée et n'est plus visible",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = () => {
    approveIdeaMutation.mutate({ id: idea.id, approved: true });
  };

  const handleReject = () => {
    approveIdeaMutation.mutate({ id: idea.id, approved: false });
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette idée ? Cette action est irréversible.")) {
      deleteIdeaMutation.mutate(idea.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="w-5 h-5 text-cjd-green" />
            Détails de l'idée
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge variant={idea.approved ? "default" : "secondary"} className="text-sm">
              {idea.approved ? "✓ Approuvée" : "⏳ En attente"}
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!idea.approved ? (
              <>
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  disabled={approveIdeaMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approuver l'idée
                </Button>
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50 flex-1"
                  disabled={approveIdeaMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
              </>
            ) : (
              <Button
                onClick={handleReject}
                variant="outline"
                className="text-orange-600 border-orange-300 hover:bg-orange-50 flex-1"
                disabled={approveIdeaMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Retirer l'approbation
              </Button>
            )}
            
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={deleteIdeaMutation.isPending}
              className="sm:w-auto"
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}