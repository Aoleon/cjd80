import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Loader2, Calendar, Users, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event, InsertInscription } from "@shared/schema";

interface EventRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: (Event & { inscriptionCount: number }) | null;
}

export default function EventRegistrationModal({ 
  open, 
  onOpenChange, 
  event 
}: EventRegistrationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comments: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({ name: "", email: "", comments: "" });
    }
  }, [open]);

  const registerMutation = useMutation({
    mutationFn: async (inscription: InsertInscription) => {
      const res = await apiRequest("POST", "/api/inscriptions", inscription);
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Erreur lors de l'inscription");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      onOpenChange(false);
      
      toast({
        title: "✅ Inscription confirmée !",
        description: `Vous êtes inscrit(e) à "${event?.title}". Un email de confirmation vous sera envoyé.`,
        duration: 6000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erreur lors de l'inscription",
        description: error.message,
        variant: "destructive",
        duration: 8000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    // Validation côté client
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir votre nom et email",
        variant: "destructive",
      });
      return;
    }

    const inscription: InsertInscription = {
      eventId: event.id,
      name: formData.name.trim(),
      email: formData.email.trim(),
      comments: formData.comments.trim() || undefined,
    };

    registerMutation.mutate(inscription);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatEventDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl mx-3 sm:mx-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-gray-800 mb-2">
            S'inscrire à l'événement
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              {/* Event Info */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-cjd-green">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">{event.title}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-cjd-green" />
                    <span>{formatEventDate(event.date.toString())}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-cjd-green" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-cjd-green" />
                    <span>
                      {event.inscriptionCount} personne(s) déjà inscrite(s)
                      {event.maxParticipants && ` / ${event.maxParticipants} maximum`}
                    </span>
                  </div>
                </div>
                {event.description && (
                  <p className="mt-3 text-sm text-gray-700">{event.description}</p>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                Remplissez les informations ci-dessous pour confirmer votre inscription.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Name Field */}
          <div>
            <Label htmlFor="participant-name" className="text-base font-medium text-gray-700">
              Votre nom complet *
            </Label>
            <Input
              id="participant-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Jean Dupont"
              required
              className="mt-2 text-base focus:ring-cjd-green focus:border-cjd-green"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ce nom apparaîtra sur la liste des participants
            </p>
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="participant-email" className="text-base font-medium text-gray-700">
              Votre email *
            </Label>
            <Input
              id="participant-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="jean.dupont@exemple.com"
              required
              className="mt-2 text-base focus:ring-cjd-green focus:border-cjd-green"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              Pour recevoir les informations et confirmations de l'événement
            </p>
          </div>

          {/* Comments Field (Optional) */}
          <div>
            <Label htmlFor="participant-comments" className="text-base font-medium text-gray-700">
              Commentaires ou informations particulières
            </Label>
            <Textarea
              id="participant-comments"
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
              placeholder="Ex: régime alimentaire, nombre d'accompagnants, questions..."
              rows={3}
              className="mt-2 text-base focus:ring-cjd-green focus:border-cjd-green"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optionnel - {500 - formData.comments.length} caractères restants
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="bg-cjd-green hover:bg-green-700 text-white flex-1"
              size="lg"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Confirmer mon inscription
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={registerMutation.isPending}
              className="px-8"
              size="lg"
            >
              Annuler
            </Button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-medium text-blue-800 mb-2">ℹ️ À propos de votre inscription</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Vous recevrez un email de confirmation</li>
            <li>• Votre email ne sera utilisé que pour cet événement</li>
            <li>• En cas d'empêchement, contactez l'organisation</li>
            <li>• Les inscriptions sont fermes et définitives</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}