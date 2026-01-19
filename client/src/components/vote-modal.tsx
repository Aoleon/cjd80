"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActionState } from "react";
import { Vote, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getIdentity, saveIdentity, clearIdentity, createUserIdentity } from "@/lib/user-identity";
import { createVote } from "../../../app/actions/ideas";
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
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feature flag for Server Actions
  const useServerActionsIdeas = process.env.NEXT_PUBLIC_USE_SERVER_ACTIONS_IDEAS === 'true';

  useEffect(() => {
    if (open) {
      // Prefill form with stored identity if available
      const storedIdentity = getIdentity();
      if (storedIdentity) {
        setFormData({
          voterName: storedIdentity.name,
          voterEmail: storedIdentity.email,
        });
      }
    } else {
      // Only clear if no stored identity or user chose not to remember
      if (!rememberMe) {
        setFormData({ voterName: "", voterEmail: "" });
      }
    }
  }, [open, rememberMe]);

  const voteMutation = useMutation({
    mutationFn: async (vote: InsertVote) => {
      const res = await apiRequest("POST", "/api/votes", vote);
      return await res.json();
    },
    onSuccess: () => {
      // Handle identity storage based on rememberMe preference
      try {
        if (rememberMe && formData.voterName && formData.voterEmail) {
          const identity = createUserIdentity(formData.voterName, formData.voterEmail);
          saveIdentity(identity);
        } else if (!rememberMe) {
          clearIdentity();
        }
      } catch (error) {
        console.warn('Failed to manage user identity:', error);
      }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;

    if (useServerActionsIdeas) {
      // Use Server Action
      setIsSubmitting(true);
      try {
        const formDataObj = new FormData();
        formDataObj.append('ideaId', idea.id);
        formDataObj.append('voterName', formData.voterName);
        formDataObj.append('voterEmail', formData.voterEmail);

        const result = await createVote(null, formDataObj);

        if (result.success) {
          // Handle identity storage
          try {
            if (rememberMe && formData.voterName && formData.voterEmail) {
              const identity = createUserIdentity(formData.voterName, formData.voterEmail);
              saveIdentity(identity);
            } else if (!rememberMe) {
              clearIdentity();
            }
          } catch (error) {
            console.warn('Failed to manage user identity:', error);
          }

          onOpenChange(false);
          toast({
            title: "Vote enregistré avec succès !",
            description: "Merci pour votre participation",
          });
        } else {
          toast({
            title: "Erreur",
            description: result.error || "Impossible d'enregistrer votre vote",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error submitting vote:', error);
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Use old API route
      voteMutation.mutate({
        ideaId: idea.id,
        voterName: formData.voterName,
        voterEmail: formData.voterEmail,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClearInfo = () => {
    try {
      clearIdentity();
      setFormData({ voterName: "", voterEmail: "" });
      toast({
        title: "Informations effacées",
        description: "Vos informations ont été supprimées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'effacer les informations",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-3 sm:mx-auto" data-testid="modal-vote">
        <DialogHeader>
          <DialogTitle>Voter pour cette idée</DialogTitle>
        </DialogHeader>
        
        {idea && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md" data-testid="text-idea-summary">
            <h4 className="font-medium text-gray-800" data-testid="text-idea-title">{idea.title}</h4>
            {idea.description && (
              <p className="text-sm text-gray-600 mt-1" data-testid="text-idea-description">{idea.description}</p>
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
              data-testid="input-voter-name"
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
              data-testid="input-voter-email"
            />
          </div>
          
          {/* Remember me checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              data-testid="checkbox-remember-me"
            />
            <Label
              htmlFor="remember-me"
              className="text-sm text-gray-700 cursor-pointer"
              data-testid="label-remember-me"
            >
              Se souvenir de moi
            </Label>
          </div>

          {/* Clear info button */}
          {(formData.voterName || formData.voterEmail) && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleClearInfo}
                className="text-xs text-gray-500 hover:text-gray-700 underline flex items-center gap-1"
                data-testid="button-clear-info"
              >
                <X className="w-3 h-3" />
                Effacer mes informations
              </button>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={useServerActionsIdeas ? isSubmitting : voteMutation.isPending}
              data-testid="button-cancel-vote"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={useServerActionsIdeas ? isSubmitting : voteMutation.isPending}
              className="bg-cjd-green hover:bg-cjd-green-dark"
              data-testid="button-submit-vote"
            >
              {(useServerActionsIdeas ? isSubmitting : voteMutation.isPending) ? (
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
