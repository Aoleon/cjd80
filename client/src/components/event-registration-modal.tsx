import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event, InsertEventRegistration } from "@shared/schema";

interface EventRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: (Event & { registrationCount: number }) | null;
}

export default function EventRegistrationModal({ 
  open, 
  onOpenChange, 
  event 
}: EventRegistrationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    participantName: "",
    participantEmail: "",
    comments: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({ participantName: "", participantEmail: "", comments: "" });
    }
  }, [open]);

  const registrationMutation = useMutation({
    mutationFn: async (registration: InsertEventRegistration) => {
      const res = await apiRequest("POST", "/api/event-registrations", registration);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      onOpenChange(false);
      toast({
        title: "Inscription confirmée !",
        description: "Vous êtes maintenant inscrit à cet événement",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de confirmer votre inscription",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    registrationMutation.mutate({
      eventId: event.id,
      participantName: formData.participantName,
      participantEmail: formData.participantEmail,
      comments: formData.comments || undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>S'inscrire à l'événement</DialogTitle>
        </DialogHeader>
        
        {event && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-800 mb-1">{event.title}</h4>
            <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
            <p className="text-sm text-gray-600">{event.location}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="registrant-name" className="text-sm font-medium text-gray-700">
              Votre nom *
            </Label>
            <Input
              id="registrant-name"
              type="text"
              value={formData.participantName}
              onChange={(e) => handleInputChange("participantName", e.target.value)}
              placeholder="Prénom Nom"
              required
              className="focus:ring-cjd-green focus:border-cjd-green"
            />
          </div>
          
          <div>
            <Label htmlFor="registrant-email" className="text-sm font-medium text-gray-700">
              Votre email *
            </Label>
            <Input
              id="registrant-email"
              type="email"
              value={formData.participantEmail}
              onChange={(e) => handleInputChange("participantEmail", e.target.value)}
              placeholder="email@exemple.com"
              required
              className="focus:ring-cjd-green focus:border-cjd-green"
            />
          </div>
          
          <div>
            <Label htmlFor="registrant-comments" className="text-sm font-medium text-gray-700">
              Commentaires (facultatif)
            </Label>
            <Textarea
              id="registrant-comments"
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
              placeholder="Allergies alimentaires, nombre d'accompagnants..."
              rows={3}
              className="focus:ring-cjd-green focus:border-cjd-green"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={registrationMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={registrationMutation.isPending}
              className="bg-cjd-green hover:bg-cjd-green-dark"
            >
              {registrationMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CalendarPlus className="w-4 h-4 mr-2" />
              )}
              Confirmer l'inscription
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
