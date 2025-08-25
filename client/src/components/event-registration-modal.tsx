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
      
      // Vérifier si une redirection externe est configurée
      if (event?.enableExternalRedirect && event?.externalRedirectUrl) {
        toast({
          title: "✅ Inscription confirmée !",
          description: `Vous êtes inscrit(e) à "${event?.title}". Vous allez être redirigé vers le site de paiement...`,
          duration: 3000,
        });
        
        // Rediriger après un court délai pour que l'utilisateur puisse voir le message
        setTimeout(() => {
          if (event.externalRedirectUrl) {
            window.open(event.externalRedirectUrl, '_blank');
          }
        }, 2000);
      } else {
        toast({
          title: "✅ Inscription confirmée !",
          description: `Vous êtes inscrit(e) à "${event?.title}". Un email de confirmation vous sera envoyé.`,
          duration: 6000,
        });
      }
      
      onOpenChange(false);
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
      <DialogContent className="w-full max-w-2xl mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left pb-4">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
            S'inscrire à l'événement
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 sm:space-y-4">
              {/* Event Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-cjd-green">
                <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2 line-clamp-2">{event.title}</h3>
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-start sm:items-center">
                    <Calendar className="w-4 h-4 mr-2 text-cjd-green flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words">{formatEventDate(event.date.toString())}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-start sm:items-center">
                      <MapPin className="w-4 h-4 mr-2 text-cjd-green flex-shrink-0 mt-0.5 sm:mt-0" />
                      <span className="break-words">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-start sm:items-center">
                    <Users className="w-4 h-4 mr-2 text-cjd-green flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words">
                      {event.inscriptionCount} personne(s) déjà inscrite(s)
                      {event.maxParticipants && ` / ${event.maxParticipants} maximum`}
                    </span>
                  </div>
                </div>
                {event.description && (
                  <p className="mt-3 text-xs sm:text-sm text-gray-700 break-words">{event.description}</p>
                )}
              </div>
              
              <p className="text-xs sm:text-sm text-gray-600">
                Remplissez les informations ci-dessous pour confirmer votre inscription.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="participant-name" className="text-sm sm:text-base font-medium text-gray-700">
              Votre nom complet *
            </Label>
            <Input
              id="participant-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Jean Dupont"
              required
              className="text-sm sm:text-base focus:ring-cjd-green focus:border-cjd-green h-10 sm:h-11"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              Ce nom apparaîtra sur la liste des participants
            </p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="participant-email" className="text-sm sm:text-base font-medium text-gray-700">
              Votre email *
            </Label>
            <Input
              id="participant-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="jean.dupont@exemple.com"
              required
              className="text-sm sm:text-base focus:ring-cjd-green focus:border-cjd-green h-10 sm:h-11"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              Pour recevoir les informations et confirmations de l'événement
            </p>
          </div>

          {/* Comments Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="participant-comments" className="text-sm sm:text-base font-medium text-gray-700">
              Commentaires ou informations particulières
            </Label>
            <Textarea
              id="participant-comments"
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
              placeholder="Ex: régime alimentaire, nombre d'accompagnants, questions..."
              rows={3}
              className="text-sm sm:text-base focus:ring-cjd-green focus:border-cjd-green resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              Optionnel - {500 - formData.comments.length} caractères restants
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="bg-cjd-green hover:bg-green-700 text-white flex-1 h-11 sm:h-12 text-sm sm:text-base"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Inscription en cours...</span>
                  <span className="sm:hidden">Inscription...</span>
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Confirmer mon inscription</span>
                  <span className="sm:hidden">S'inscrire</span>
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={registerMutation.isPending}
              className="sm:px-8 h-11 sm:h-12 text-sm sm:text-base"
            >
              Annuler
            </Button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">ℹ️ À propos de votre inscription</h4>
          <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
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