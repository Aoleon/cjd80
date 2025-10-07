import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Loader2, Calendar, Edit, Trash2, ExternalLink, ChevronDown, ChevronRight, Settings, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
    location: "",
    maxParticipants: undefined as number | undefined,
    helloAssoLink: "",
    enableExternalRedirect: false,
    externalRedirectUrl: "",
    showInscriptionsCount: true,
    showAvailableSeats: true,
    allowUnsubscribe: false,
    redUnsubscribeButton: false,
    buttonMode: "subscribe" as "subscribe" | "unsubscribe" | "both" | "custom",
    customButtonText: "",
  });

  // États pour les sections collapsibles
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showDisplayOptions, setShowDisplayOptions] = useState(false);

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
          location: event.location || "",
          maxParticipants: event.maxParticipants || undefined,
          helloAssoLink: event.helloAssoLink || "",
          enableExternalRedirect: Boolean(event.enableExternalRedirect),
          externalRedirectUrl: event.externalRedirectUrl || "",
          showInscriptionsCount: Boolean(event.showInscriptionsCount),
          showAvailableSeats: Boolean(event.showAvailableSeats),
          allowUnsubscribe: Boolean(event.allowUnsubscribe),
          redUnsubscribeButton: Boolean(event.redUnsubscribeButton),
          buttonMode: (event.buttonMode || "subscribe") as "subscribe" | "unsubscribe" | "both" | "custom",
          customButtonText: event.customButtonText || "",
        });
      } else {
        // Reset form for create mode
        setFormData({
          title: "",
          description: "",
          date: "",
          location: "",
          maxParticipants: undefined,
          helloAssoLink: "",
          enableExternalRedirect: false,
          externalRedirectUrl: "",
          showInscriptionsCount: true,
          showAvailableSeats: true,
          allowUnsubscribe: false,
          redUnsubscribeButton: false,
          buttonMode: "subscribe",
          customButtonText: "",
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
      location: formData.location.trim() || undefined,
      maxParticipants: formData.maxParticipants || undefined,
      helloAssoLink: formData.helloAssoLink.trim() || undefined,
      enableExternalRedirect: formData.enableExternalRedirect,
      externalRedirectUrl: formData.enableExternalRedirect && formData.externalRedirectUrl.trim() ? formData.externalRedirectUrl.trim() : undefined,
      showInscriptionsCount: formData.showInscriptionsCount,
      showAvailableSeats: formData.showAvailableSeats,
      allowUnsubscribe: formData.allowUnsubscribe,
      redUnsubscribeButton: formData.redUnsubscribeButton,
      buttonMode: formData.buttonMode,
      customButtonText: formData.buttonMode === "custom" ? (formData.customButtonText.trim() || undefined) : undefined,
    };


    if (mode === "create") {
      createEventMutation.mutate(eventData);
    } else {
      updateEventMutation.mutate(eventData);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isPending = createEventMutation.isPending || updateEventMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogHeader className="text-left pb-2">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 mb-2 flex items-center gap-2 flex-wrap">
            {mode === "create" ? (
              <>
                <CalendarPlus className="h-5 w-5 text-cjd-green flex-shrink-0" />
                <span>Créer un nouvel événement</span>
              </>
            ) : (
              <>
                <Edit className="h-5 w-5 text-cjd-green flex-shrink-0" />
                <span>Modifier l'événement</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === "create" 
              ? "Ajoutez un nouvel événement pour la section CJD Amiens. Les membres pourront s'y inscrire." 
              : "Modifiez les informations de cet événement. Les participants déjà inscrits seront préservés."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* === INFORMATIONS ESSENTIELLES === */}
          <div className="space-y-4">
            {/* Titre et Date sur la même ligne */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-title" className="text-sm font-medium text-gray-700">
                  Titre de l'événement *
                </Label>
                <Input
                  id="event-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ex: Afterwork tech & innovation"
                  required
                  className="mt-1 focus:ring-cjd-green focus:border-cjd-green"
                  maxLength={200}
                  data-testid="input-event-title"
                />
              </div>
              
              <div>
                <Label htmlFor="event-date" className="text-sm font-medium text-gray-700">
                  Date et heure *
                </Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                  className="mt-1 focus:ring-cjd-green focus:border-cjd-green"
                  data-testid="input-event-date"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="event-description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="event-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez l'événement, le programme, les intervenants..."
                rows={2}
                className="mt-1 focus:ring-cjd-green focus:border-cjd-green resize-none"
                maxLength={1000}
                data-testid="input-event-description"
              />
            </div>

            {/* Lieu et Places sur la même ligne */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-location" className="text-sm font-medium text-gray-700">
                  Lieu
                </Label>
                <Input
                  id="event-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Ex: CCI Amiens"
                  className="mt-1 focus:ring-cjd-green focus:border-cjd-green"
                  maxLength={200}
                  data-testid="input-event-location"
                />
              </div>
              
              <div>
                <Label htmlFor="event-max-participants" className="text-sm font-medium text-gray-700">
                  Nombre de places
                </Label>
                <Input
                  id="event-max-participants"
                  type="number"
                  value={formData.maxParticipants?.toString() || ""}
                  onChange={(e) => handleInputChange("maxParticipants", e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Ex: 50"
                  min="1"
                  max="1000"
                  className="mt-1 focus:ring-cjd-green focus:border-cjd-green"
                  data-testid="input-event-max-participants"
                />
              </div>
            </div>
          </div>

          {/* === OPTIONS AVANCÉES (COLLAPSIBLE) === */}
          <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors" data-testid="toggle-advanced-options">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Options avancées</span>
              </div>
              {showAdvancedOptions ? 
                <ChevronDown className="h-4 w-4 text-gray-600" /> : 
                <ChevronRight className="h-4 w-4 text-gray-600" />
              }
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 mt-2">
              {/* HelloAsso Link */}
              <div className="p-3 bg-white rounded border border-gray-200">
                <Label htmlFor="event-helloasso" className="text-sm font-medium text-gray-700 block mb-2">
                  Lien HelloAsso
                </Label>
                <Input
                  id="event-helloasso"
                  type="url"
                  value={formData.helloAssoLink}
                  onChange={(e) => handleInputChange("helloAssoLink", e.target.value)}
                  placeholder="https://www.helloasso.com/..."
                  className="focus:ring-cjd-green focus:border-cjd-green"
                  data-testid="input-event-helloasso"
                />
              </div>

              {/* Redirection externe */}
              <div className="p-3 bg-white rounded border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="enable-redirect"
                    checked={formData.enableExternalRedirect}
                    onCheckedChange={(checked) => handleInputChange("enableExternalRedirect", checked as boolean)}
                  />
                  <Label htmlFor="enable-redirect" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Redirection après inscription
                  </Label>
                </div>
                
                {formData.enableExternalRedirect && (
                  <Input
                    id="redirect-url"
                    type="url"
                    value={formData.externalRedirectUrl}
                    onChange={(e) => handleInputChange("externalRedirectUrl", e.target.value)}
                    placeholder="https://www.helloasso.com/..."
                    className="mt-2 focus:ring-cjd-green focus:border-cjd-green"
                    required={formData.enableExternalRedirect}
                    data-testid="input-redirect-url"
                  />
                )}
              </div>

              {/* Type de bouton */}
              <div className="p-3 bg-white rounded border border-gray-200">
                <Label htmlFor="button-mode" className="text-sm font-medium text-gray-700 block mb-2">
                  Type de bouton
                </Label>
                <Select
                  value={formData.buttonMode}
                  onValueChange={(value) => handleInputChange("buttonMode", value)}
                >
                  <SelectTrigger className="focus:ring-cjd-green focus:border-cjd-green" data-testid="select-button-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscribe">S'inscrire</SelectItem>
                    <SelectItem value="unsubscribe">Se désinscrire</SelectItem>
                    <SelectItem value="both">Les deux</SelectItem>
                    <SelectItem value="custom">Bouton personnalisé</SelectItem>
                  </SelectContent>
                </Select>
                
                {(formData.buttonMode === "unsubscribe" || formData.buttonMode === "both") && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="red-unsubscribe"
                      checked={formData.redUnsubscribeButton}
                      onCheckedChange={(checked) => handleInputChange("redUnsubscribeButton", checked as boolean)}
                    />
                    <Label htmlFor="red-unsubscribe" className="text-sm text-gray-600 cursor-pointer">
                      Bouton rouge (plénières)
                    </Label>
                  </div>
                )}

                {formData.buttonMode === "custom" && (
                  <div className="mt-2">
                    <Label htmlFor="custom-button-text" className="text-sm font-medium text-gray-700 block mb-2">
                      Texte du bouton personnalisé
                    </Label>
                    <Input
                      id="custom-button-text"
                      type="text"
                      value={formData.customButtonText}
                      onChange={(e) => handleInputChange("customButtonText", e.target.value)}
                      placeholder="Ex: Contacter Charlotte, Voir le lien, etc."
                      className="focus:ring-cjd-green focus:border-cjd-green"
                      maxLength={50}
                      data-testid="input-custom-button-text"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ce texte apparaîtra sur le bouton (max 50 caractères)
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* === OPTIONS D'AFFICHAGE (COLLAPSIBLE) === */}
          <Collapsible open={showDisplayOptions} onOpenChange={setShowDisplayOptions}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors" data-testid="toggle-display-options">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Options d'affichage des inscriptions</span>
              </div>
              {showDisplayOptions ? 
                <ChevronDown className="h-4 w-4 text-blue-600" /> : 
                <ChevronRight className="h-4 w-4 text-blue-600" />
              }
            </CollapsibleTrigger>
            
            <CollapsibleContent className="p-3 mt-2 bg-white rounded border border-blue-200">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-inscriptions"
                    checked={formData.showInscriptionsCount}
                    onCheckedChange={(checked) => handleInputChange("showInscriptionsCount", checked as boolean)}
                  />
                  <Label htmlFor="show-inscriptions" className="text-sm text-gray-700 cursor-pointer">
                    Afficher le nombre d'inscrits
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-seats"
                    checked={formData.showAvailableSeats}
                    onCheckedChange={(checked) => handleInputChange("showAvailableSeats", checked as boolean)}
                    disabled={!formData.maxParticipants}
                  />
                  <Label 
                    htmlFor="show-seats" 
                    className={`text-sm cursor-pointer ${
                      !formData.maxParticipants ? 'text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    Afficher les places restantes {!formData.maxParticipants && "(nécessite un nombre de places)"}
                  </Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-cjd-green hover:bg-green-700 text-white flex-1"
              data-testid="button-submit-event"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Création..." : "Modification..."}
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
              data-testid="button-cancel-event"
            >
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}