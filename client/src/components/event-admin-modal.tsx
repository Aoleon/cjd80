"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarPlus, Loader2, Calendar, Edit, Trash2, ExternalLink, ChevronDown, ChevronRight, Settings, Eye, EyeOff, Plus, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event, InsertEvent, EventSponsorship, InsertEventSponsorship } from "@shared/schema";
import { getShortAppName } from '@/config/branding';

interface EventAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null; // For edit mode
  mode: "create" | "edit";
}

// Types for sponsors
type Patron = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
};

type EventSponsorshipWithRelations = EventSponsorship & {
  patron?: Patron;
};

// Helper functions for sponsorship display
const getSponsorshipLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    platinum: "Platine",
    gold: "Or",
    silver: "Argent",
    bronze: "Bronze",
    partner: "Partenaire",
  };
  return labels[level] || level;
};

const getSponsorshipLevelBadgeClass = (level: string): string => {
  const classes: Record<string, string> = {
    platinum: "bg-violet-600 text-white hover:bg-violet-700",
    gold: "bg-amber-500 text-white hover:bg-amber-600",
    silver: "bg-slate-400 text-white hover:bg-slate-500",
    bronze: "bg-orange-600 text-white hover:bg-orange-700",
    partner: "bg-blue-600 text-white hover:bg-blue-700",
  };
  return classes[level] || "";
};

const getSponsorshipStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    proposed: "Proposé",
    confirmed: "Confirmé",
    completed: "Réalisé",
    cancelled: "Annulé",
  };
  return labels[status] || status;
};

const getSponsorshipStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    proposed: "secondary",
    confirmed: "default",
    completed: "outline",
    cancelled: "destructive",
  };
  return variants[status] || "default";
};

const formatEuros = (cents: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
};

// Sponsor form schema
const sponsorFormSchema = z.object({
  patronId: z.string().min(1, "Veuillez sélectionner un mécène"),
  level: z.enum(["platinum", "gold", "silver", "bronze", "partner"], {
    errorMap: () => ({ message: "Veuillez sélectionner un niveau" })
  }),
  amount: z.number().min(0, "Le montant ne peut pas être négatif"),
  benefits: z.string().optional(),
  isPubliclyVisible: z.boolean().default(true),
  status: z.enum(["proposed", "confirmed", "completed", "cancelled"], {
    errorMap: () => ({ message: "Veuillez sélectionner un statut" })
  }),
});

type SponsorFormValues = z.infer<typeof sponsorFormSchema>;

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

  // États pour les sponsors
  const [activeTab, setActiveTab] = useState<"informations" | "sponsors">("informations");
  const [isAddSponsorDialogOpen, setIsAddSponsorDialogOpen] = useState(false);
  const [isEditSponsorDialogOpen, setIsEditSponsorDialogOpen] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [deleteSponsorId, setDeleteSponsorId] = useState<string | null>(null);

  // Helper function to format UTC date for datetime-local input (in local timezone)
  const formatDateForInput = (utcDate: string | Date): string => {
    const date = new Date(utcDate);
    // Get timezone offset in minutes and convert to milliseconds
    const offset = date.getTimezoneOffset() * 60 * 1000;
    // Create a new date adjusted for local timezone
    const localDate = new Date(date.getTime() - offset);
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    return localDate.toISOString().slice(0, 16);
  };

  // Initialize form when modal opens or event changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && event) {
        // Format date for datetime-local input (preserving local timezone)
        const formattedDate = formatDateForInput(event.date);
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

  // Form pour les sponsors
  const sponsorForm = useForm<SponsorFormValues>({
    resolver: zodResolver(sponsorFormSchema),
    defaultValues: {
      patronId: "",
      level: "partner",
      amount: 0,
      benefits: "",
      isPubliclyVisible: true,
      status: "proposed",
    },
  });

  // Queries pour les sponsors
  const { data: sponsorsResponse, isLoading: sponsorsLoading } = useQuery<{ success: boolean; data: EventSponsorshipWithRelations[] }>({
    queryKey: ["/api/events", event?.id, "sponsorships"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${event?.id}/sponsorships`);
      if (!res.ok) throw new Error('Failed to fetch sponsorships');
      return res.json();
    },
    enabled: mode === "edit" && !!event?.id && open,
  });

  const sponsors = sponsorsResponse?.data || [];

  const { data: patronsResponse } = useQuery<{ data: Patron[]; total: number }>({
    queryKey: ["/api/patrons", 1, 1000],
    queryFn: async () => {
      const res = await fetch("/api/patrons?page=1&limit=1000");
      if (!res.ok) throw new Error('Failed to fetch patrons');
      return res.json();
    },
    enabled: mode === "edit" && open,
  });

  const patrons = patronsResponse?.data || [];

  // Mutations pour les sponsors
  const createSponsorMutation = useMutation({
    mutationFn: (data: SponsorFormValues) => {
      const amountInCents = Math.round(data.amount * 100);
      return apiRequest("POST", `/api/events/${event?.id}/sponsorships`, {
        ...data,
        amount: amountInCents,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", event?.id, "sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships"] });
      setIsAddSponsorDialogOpen(false);
      sponsorForm.reset();
      toast({ title: "✅ Sponsor ajouté avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible d'ajouter le sponsor",
        variant: "destructive",
      });
    },
  });

  const updateSponsorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SponsorFormValues> }) => {
      const payload = { ...data };
      if (data.amount !== undefined) {
        payload.amount = Math.round(data.amount * 100);
      }
      return apiRequest("PATCH", `/api/sponsorships/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", event?.id, "sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships"] });
      setIsEditSponsorDialogOpen(false);
      setEditingSponsorId(null);
      toast({ title: "✅ Sponsor modifié avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de modifier le sponsor",
        variant: "destructive",
      });
    },
  });

  const deleteSponsorMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/sponsorships/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", event?.id, "sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships"] });
      setDeleteSponsorId(null);
      toast({ title: "✅ Sponsor supprimé avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de supprimer le sponsor",
        variant: "destructive",
      });
    },
  });

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

  // Handlers pour les sponsors
  const handleCreateSponsor = (data: SponsorFormValues) => {
    createSponsorMutation.mutate(data);
  };

  const handleEditSponsor = (data: SponsorFormValues) => {
    if (!editingSponsorId) return;
    updateSponsorMutation.mutate({ id: editingSponsorId, data });
  };

  const openEditSponsorDialog = (sponsorship: EventSponsorshipWithRelations) => {
    setEditingSponsorId(sponsorship.id);
    sponsorForm.reset({
      patronId: sponsorship.patronId,
      level: sponsorship.level as any,
      amount: sponsorship.amount / 100,
      benefits: sponsorship.benefits || "",
      isPubliclyVisible: sponsorship.isPubliclyVisible,
      status: sponsorship.status as any,
    });
    setIsEditSponsorDialogOpen(true);
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
              ? `Ajoutez un nouvel événement pour la section ${getShortAppName()}. Les membres pourront s'y inscrire.` 
              : "Modifiez les informations de cet événement. Les participants déjà inscrits seront préservés."
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "informations" | "sponsors")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2" data-testid="tabs-event-modal">
            <TabsTrigger value="informations" data-testid="tab-informations">
              <Calendar className="h-4 w-4 mr-2" />
              Informations
            </TabsTrigger>
            {mode === "edit" && (
              <TabsTrigger value="sponsors" data-testid="tab-sponsors">
                <Award className="h-4 w-4 mr-2" />
                Sponsors
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="informations" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                Description (vous pouvez ajouter des images)
              </Label>
              <RichTextEditor
                content={formData.description}
                onChange={(html) => handleInputChange("description", html)}
                placeholder="Décrivez l'événement, le programme, les intervenants... Vous pouvez ajouter du formatage et des images."
                maxLength={10000}
                className="mt-1"
                testId="editor-event-description"
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
                  type="text"
                  value={formData.helloAssoLink}
                  onChange={(e) => handleInputChange("helloAssoLink", e.target.value)}
                  placeholder="https://www.helloasso.com/..."
                  className="focus:ring-cjd-green focus:border-cjd-green"
                  data-testid="input-event-helloasso"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide si vous n'utilisez pas HelloAsso. Le lien peut être supprimé ou modifié librement.
                </p>
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
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-info-light hover:bg-info-light rounded-lg border border-info transition-colors" data-testid="toggle-display-options">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-info" />
                <span className="text-sm font-medium text-gray-700">Options d'affichage des inscriptions</span>
              </div>
              {showDisplayOptions ? 
                <ChevronDown className="h-4 w-4 text-info" /> : 
                <ChevronRight className="h-4 w-4 text-info" />
              }
            </CollapsibleTrigger>
            
            <CollapsibleContent className="p-3 mt-2 bg-white rounded border border-info">
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
              className="bg-cjd-green hover:bg-cjd-green-dark text-white flex-1"
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
          </TabsContent>

          {/* Onglet Sponsors - Visible uniquement en mode edit */}
          {mode === "edit" && (
            <TabsContent value="sponsors" className="mt-4">
              <div className="space-y-4">
                {/* En-tête avec bouton d'ajout */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold" data-testid="text-sponsors-title">Sponsors de l'événement</h3>
                    <p className="text-sm text-gray-600" data-testid="text-sponsors-subtitle">
                      Gérez les sponsors associés à cet événement
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      sponsorForm.reset();
                      setIsAddSponsorDialogOpen(true);
                    }}
                    data-testid="button-add-sponsor"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un sponsor
                  </Button>
                </div>

                {/* Liste des sponsors */}
                {sponsorsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : sponsors.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed" data-testid="text-no-sponsors">
                    <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">Aucun sponsor pour cet événement</p>
                    <p className="text-sm mt-1">Cliquez sur "Ajouter un sponsor" pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sponsors.map((sponsorship) => (
                      <div
                        key={sponsorship.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        data-testid={`sponsor-item-${sponsorship.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium" data-testid={`sponsor-patron-${sponsorship.id}`}>
                                {sponsorship.patron
                                  ? `${sponsorship.patron.firstName} ${sponsorship.patron.lastName}`
                                  : "—"}
                              </h4>
                              {sponsorship.patron?.company && (
                                <span className="text-sm text-gray-500">({sponsorship.patron.company})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge
                                className={getSponsorshipLevelBadgeClass(sponsorship.level)}
                                data-testid={`sponsor-level-${sponsorship.id}`}
                              >
                                {getSponsorshipLevelLabel(sponsorship.level)}
                              </Badge>
                              <span className="text-sm font-medium" data-testid={`sponsor-amount-${sponsorship.id}`}>
                                {formatEuros(sponsorship.amount)}
                              </span>
                              <Badge
                                variant={getSponsorshipStatusBadgeVariant(sponsorship.status)}
                                data-testid={`sponsor-status-${sponsorship.id}`}
                              >
                                {getSponsorshipStatusLabel(sponsorship.status)}
                              </Badge>
                              <div className="flex items-center gap-1" data-testid={`sponsor-visibility-${sponsorship.id}`}>
                                {sponsorship.isPubliclyVisible ? (
                                  <><Eye className="w-4 h-4 text-success" /><span className="text-xs text-muted-foreground">Public</span></>
                                ) : (
                                  <><EyeOff className="w-4 h-4 text-gray-400" /><span className="text-xs text-gray-600">Privé</span></>
                                )}
                              </div>
                            </div>
                            {sponsorship.benefits && (
                              <p className="text-sm text-gray-600 mt-2" data-testid={`sponsor-benefits-${sponsorship.id}`}>
                                {sponsorship.benefits}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditSponsorDialog(sponsorship)}
                              data-testid={`button-edit-sponsor-${sponsorship.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteSponsorId(sponsorship.id)}
                              data-testid={`button-delete-sponsor-${sponsorship.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-error" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Dialog pour ajouter un sponsor */}
        <Dialog open={isAddSponsorDialogOpen} onOpenChange={setIsAddSponsorDialogOpen}>
          <DialogContent className="max-w-lg" data-testid="dialog-add-sponsor">
            <DialogHeader>
              <DialogTitle>Ajouter un sponsor</DialogTitle>
              <DialogDescription>
                Associez un mécène à cet événement en tant que sponsor
              </DialogDescription>
            </DialogHeader>
            <Form {...sponsorForm}>
              <form onSubmit={sponsorForm.handleSubmit(handleCreateSponsor)} className="space-y-4">
                <FormField
                  control={sponsorForm.control}
                  name="patronId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mécène *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sponsor-patron">
                            <SelectValue placeholder="Sélectionner un mécène" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patrons.map((patron) => (
                            <SelectItem key={patron.id} value={patron.id}>
                              {patron.firstName} {patron.lastName}
                              {patron.company && ` (${patron.company})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sponsorForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sponsor-level">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="platinum">Platine</SelectItem>
                          <SelectItem value="gold">Or</SelectItem>
                          <SelectItem value="silver">Argent</SelectItem>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="partner">Partenaire</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sponsorForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant (€) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-sponsor-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sponsorForm.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bénéfices/Contreparties</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Description des bénéfices offerts au sponsor..."
                          rows={3}
                          data-testid="input-sponsor-benefits"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sponsorForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sponsor-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="proposed">Proposé</SelectItem>
                          <SelectItem value="confirmed">Confirmé</SelectItem>
                          <SelectItem value="completed">Réalisé</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sponsorForm.control}
                  name="isPubliclyVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-sponsor-visible"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Visibilité publique</FormLabel>
                        <p className="text-sm text-gray-500">
                          Le sponsor sera visible publiquement
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddSponsorDialogOpen(false)}
                    data-testid="button-cancel-add-sponsor"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={createSponsorMutation.isPending}
                    data-testid="button-submit-add-sponsor"
                  >
                    {createSponsorMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ajout...</>
                    ) : (
                      "Ajouter"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog pour éditer un sponsor */}
        <Dialog open={isEditSponsorDialogOpen} onOpenChange={setIsEditSponsorDialogOpen}>
          <DialogContent className="max-w-lg" data-testid="dialog-edit-sponsor">
            <DialogHeader>
              <DialogTitle>Modifier un sponsor</DialogTitle>
              <DialogDescription>
                Modifiez les informations du sponsor
              </DialogDescription>
            </DialogHeader>
            <Form {...sponsorForm}>
              <form onSubmit={sponsorForm.handleSubmit(handleEditSponsor)} className="space-y-4">
                <FormField
                  control={sponsorForm.control}
                  name="patronId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mécène *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-sponsor-patron">
                            <SelectValue placeholder="Sélectionner un mécène" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patrons.map((patron) => (
                            <SelectItem key={patron.id} value={patron.id}>
                              {patron.firstName} {patron.lastName}
                              {patron.company && ` (${patron.company})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sponsorForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-sponsor-level">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="platinum">Platine</SelectItem>
                          <SelectItem value="gold">Or</SelectItem>
                          <SelectItem value="silver">Argent</SelectItem>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="partner">Partenaire</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sponsorForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant (€) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-edit-sponsor-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sponsorForm.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bénéfices/Contreparties</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Description des bénéfices offerts au sponsor..."
                          rows={3}
                          data-testid="input-edit-sponsor-benefits"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sponsorForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-sponsor-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="proposed">Proposé</SelectItem>
                          <SelectItem value="confirmed">Confirmé</SelectItem>
                          <SelectItem value="completed">Réalisé</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sponsorForm.control}
                  name="isPubliclyVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-edit-sponsor-visible"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Visibilité publique</FormLabel>
                        <p className="text-sm text-gray-500">
                          Le sponsor sera visible publiquement
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditSponsorDialogOpen(false)}
                    data-testid="button-cancel-edit-sponsor"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateSponsorMutation.isPending}
                    data-testid="button-submit-edit-sponsor"
                  >
                    {updateSponsorMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Modification...</>
                    ) : (
                      "Modifier"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={!!deleteSponsorId} onOpenChange={() => setDeleteSponsorId(null)}>
          <AlertDialogContent data-testid="dialog-delete-sponsor">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce sponsor ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le sponsor sera définitivement supprimé de cet événement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-sponsor">Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteSponsorId && deleteSponsorMutation.mutate(deleteSponsorId)}
                className="bg-error hover:bg-error-dark"
                data-testid="button-confirm-delete-sponsor"
              >
                {deleteSponsorMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Suppression...</>
                ) : (
                  "Supprimer"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}