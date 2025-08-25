import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Loader2, Calendar, Edit, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Event, InsertEvent } from "@shared/schema";

interface EventAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null; // For edit mode
  mode: "create" | "edit";
}

export default function EventAdminModal({ 
  open, 
  onOpenChange, 
  event = null,
  mode 
}: EventAdminModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    helloAssoLink: "",
    enableExternalRedirect: false,
    externalRedirectUrl: "",
  });

  // Initialize form when modal opens or event changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && event) {
        // Format date for datetime-local input
        const formattedDate = new Date(event.date).toISOString().slice(0, 16);
        setFormData({
          title: event.title,
          description: event.description || "",
          date: formattedDate,
          helloAssoLink: event.helloAssoLink || "",
          enableExternalRedirect: event.enableExternalRedirect || false,
          externalRedirectUrl: event.externalRedirectUrl || "",
        });
      } else {
        // Reset form for create mode
        setFormData({
          title: "",
          description: "",
          date: "",
          helloAssoLink: "",
          enableExternalRedirect: false,
          externalRedirectUrl: "",
        });
      }
    }
  }, [open, event, mode]);

  const createEventMutation = useMutation({
    mutationFn: async (eventData: InsertEvent) => {
      const res = await apiRequest("POST", "/api/events", eventData);
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Erreur lors de la création de l'événement");
      }
      return await res.json();
    },
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      onOpenChange(false);
      
      toast({
        title: "✅ Événement créé avec succès !",
        description: `"${newEvent.title}" a été ajouté aux événements`,
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erreur lors de la création",
        description: error.message,
        variant: "destructive",
        duration: 8000,
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: Partial<InsertEvent>) => {
      if (!event) throw new Error("Aucun événement à modifier");
      
      const res = await apiRequest("PUT", `/api/events/${event.id}`, eventData);
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Erreur lors de la modification de l'événement");
      }
      return await res.json();
    },
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      onOpenChange(false);
      
      toast({
        title: "✅ Événement modifié avec succès !",
        description: `"${updatedEvent.title}" a été mis à jour`,
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erreur lors de la modification",
        description: error.message,
        variant: "destructive",
        duration: 8000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation côté client
    if (!formData.title.trim() || !formData.date) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir au minimum le titre et la date",
        variant: "destructive",
      });
      return;
    }

    // Validation de la date (doit être dans le futur)
    const selectedDate = new Date(formData.date);
    if (selectedDate <= new Date()) {
      toast({
        title: "Date invalide",
        description: "La date de l'événement doit être dans le futur",
        variant: "destructive",
      });
      return;
    }

    const eventData: InsertEvent = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      date: selectedDate.toISOString(),
      helloAssoLink: formData.helloAssoLink.trim() || undefined,
      enableExternalRedirect: formData.enableExternalRedirect,
      externalRedirectUrl: formData.enableExternalRedirect && formData.externalRedirectUrl.trim() ? formData.externalRedirectUrl.trim() : undefined,
    };

    if (mode === "create") {
      createEventMutation.mutate(eventData);
    } else {
      updateEventMutation.mutate(eventData);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isPending = createEventMutation.isPending || updateEventMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            {mode === "create" ? (
              <>
                <CalendarPlus className="h-5 w-5 text-cjd-green" />
                Créer un nouvel événement
              </>
            ) : (
              <>
                <Edit className="h-5 w-5 text-cjd-green" />
                Modifier l'événement
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Ajoutez un nouvel événement pour la section CJD Amiens. Les membres pourront s'y inscrire." 
              : "Modifiez les informations de cet événement. Les participants déjà inscrits seront préservés."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Title Field */}
          <div>
            <Label htmlFor="event-title" className="text-base font-medium text-gray-700">
              Titre de l'événement *
            </Label>
            <Input
              id="event-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ex: Afterwork tech & innovation"
              required
              className="mt-2 text-base focus:ring-cjd-green focus:border-cjd-green"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              Un titre accrocheur pour votre événement (max 200 caractères)
            </p>
          </div>

          {/* Date Field */}
          <div>
            <Label htmlFor="event-date" className="text-base font-medium text-gray-700">
              Date et heure *
            </Label>
            <Input
              id="event-date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
              className="mt-2 text-base focus:ring-cjd-green focus:border-cjd-green"
            />
            <p className="text-xs text-gray-500 mt-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              La date doit être dans le futur
            </p>
          </div>

          {/* Description Field */}
          <div>
            <Label htmlFor="event-description" className="text-base font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="event-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Décrivez l'événement, le programme, les intervenants..."
              rows={4}
              className="mt-2 text-base focus:ring-cjd-green focus:border-cjd-green"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optionnel - {1000 - formData.description.length} caractères restants
            </p>
          </div>

          {/* HelloAsso Link Field */}
          <div>
            <Label htmlFor="event-helloasso" className="text-base font-medium text-gray-700">
              Lien HelloAsso (optionnel)
            </Label>
            <Input
              id="event-helloasso"
              type="url"
              value={formData.helloAssoLink}
              onChange={(e) => handleInputChange("helloAssoLink", e.target.value)}
              placeholder="https://www.helloasso.com/..."
              className="mt-2 text-base focus:ring-cjd-green focus:border-cjd-green"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lien vers la billetterie HelloAsso si l'événement est payant
            </p>
          </div>

          {/* External Redirect Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-redirect"
                checked={formData.enableExternalRedirect}
                onCheckedChange={(checked) => handleInputChange("enableExternalRedirect", checked as boolean)}
              />
              <Label 
                htmlFor="enable-redirect" 
                className="text-base font-medium text-gray-700 cursor-pointer"
              >
                <ExternalLink className="inline h-4 w-4 mr-2" />
                Activer la redirection externe après inscription
              </Label>
            </div>

            {formData.enableExternalRedirect && (
              <div className="ml-6">
                <Label htmlFor="redirect-url" className="text-sm font-medium text-gray-700">
                  URL de redirection
                </Label>
                <Input
                  id="redirect-url"
                  type="url"
                  value={formData.externalRedirectUrl}
                  onChange={(e) => handleInputChange("externalRedirectUrl", e.target.value)}
                  placeholder="https://www.helloasso.com/associations/..."
                  className="mt-2 text-base focus:ring-cjd-green focus:border-cjd-green"
                  required={formData.enableExternalRedirect}
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'utilisateur sera redirigé vers cette URL après avoir complété son inscription
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-cjd-green hover:bg-green-700 text-white flex-1"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Création en cours..." : "Modification en cours..."}
                </>
              ) : (
                <>
                  {mode === "create" ? (
                    <>
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Créer l'événement
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier l'événement
                    </>
                  )}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="px-8"
              size="lg"
            >
              Annuler
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-medium text-blue-800 mb-2">💡 Conseils pour un bon événement</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Choisissez un titre accrocheur et explicite</li>
            <li>• Précisez le lieu dans la description</li>
            <li>• Mentionnez les intervenants si pertinent</li>
            <li>• Ajoutez le lien HelloAsso pour les événements payants</li>
            <li>• Prévenez suffisamment à l'avance</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}