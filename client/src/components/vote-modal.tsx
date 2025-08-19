import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Vote, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Idea, InsertVote } from "@shared/schema";

interface VoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: (Idea & { voteCount: number }) | null;
}

export default function VoteModal({ open, onOpenChange, idea }: VoteModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    voterName: "",
    voterEmail: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({ voterName: "", voterEmail: "" });
    }
  }, [open]);

  const voteMutation = useMutation({
    mutationFn: async (vote: InsertVote) => {
      const res = await apiRequest("POST", "/api/votes", vote);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      onOpenChange(false);
      toast({
        title: "Vote enregistré avec succès !",
        description: "Merci pour votre participation",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer votre vote",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;

    voteMutation.mutate({
      ideaId: idea.id,
      voterName: formData.voterName,
      voterEmail: formData.voterEmail,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Voter pour cette idée</DialogTitle>
        </DialogHeader>
        
        {idea && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-800">{idea.title}</h4>
            {idea.description && (
              <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="voter-name" className="text-sm font-medium text-gray-700">
              Votre nom *
            </Label>
            <Input
              id="voter-name"
              type="text"
              value={formData.voterName}
              onChange={(e) => handleInputChange("voterName", e.target.value)}
              placeholder="Prénom Nom"
              required
              className="focus:ring-cjd-green focus:border-cjd-green"
            />
          </div>
          
          <div>
            <Label htmlFor="voter-email" className="text-sm font-medium text-gray-700">
              Votre email *
            </Label>
            <Input
              id="voter-email"
              type="email"
              value={formData.voterEmail}
              onChange={(e) => handleInputChange("voterEmail", e.target.value)}
              placeholder="email@exemple.com"
              required
              className="focus:ring-cjd-green focus:border-cjd-green"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={voteMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={voteMutation.isPending}
              className="bg-cjd-green hover:bg-cjd-green-dark"
            >
              {voteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Vote className="w-4 h-4 mr-2" />
              )}
              Confirmer le vote
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
