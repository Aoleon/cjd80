import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import AdminHeader from "@/components/admin-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SimplePagination } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Search, Plus, Edit, Trash2, Euro, Calendar, User, Building2, Phone, Mail, FileText, Coffee, Star, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

// Types from schema
type Patron = {
  id: string;
  firstName: string;
  lastName: string;
  role: string | null;
  company: string | null;
  phone: string | null;
  email: string;
  notes: string | null;
  status: string;
  referrerId: string | null;
  referrer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
  } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string | null;
};

type PatronDonation = {
  id: string;
  patronId: string;
  donatedAt: Date | string;
  amount: number;
  occasion: string;
  recordedBy: string;
  createdAt: Date | string;
};

type PatronUpdate = {
  id: string;
  patronId: string;
  type: "meeting" | "email" | "call" | "lunch" | "event";
  subject: string;
  date: string;
  startTime: string | null;
  duration: number | null;
  description: string;
  notes: string | null;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type Event = {
  id: string;
  title: string;
  date: Date | string;
  status: string;
};

type EventSponsorship = {
  id: string;
  eventId: string;
  patronId: string;
  level: "platinum" | "gold" | "silver" | "bronze" | "partner";
  amount: number;
  benefits: string | null;
  isPubliclyVisible: boolean;
  status: "proposed" | "confirmed" | "completed" | "cancelled";
  event?: Event;
  createdAt: Date | string;
  updatedAt: Date | string;
};

// Form schemas
const patronFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  company: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  notes: z.string().optional(),
  referrerId: z.string().optional(),
});

const donationFormSchema = z.object({
  amount: z.number().min(0, "Le montant ne peut pas être négatif"),
  donatedAt: z.string(),
  occasion: z.string().min(3, "L'occasion doit contenir au moins 3 caractères"),
});

const updateFormSchema = z.object({
  type: z.enum(["meeting", "email", "call", "lunch", "event"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type" })
  }),
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  startTime: z.string().optional(),
  duration: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : undefined),
  description: z.string().min(1, "La description est obligatoire"),
  notes: z.string().optional(),
});

const sponsorshipFormSchema = z.object({
  eventId: z.string().min(1, "Veuillez sélectionner un événement"),
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

type PatronFormValues = z.infer<typeof patronFormSchema>;
type DonationFormValues = z.infer<typeof donationFormSchema>;
type UpdateFormValues = z.infer<typeof updateFormSchema>;
type SponsorshipFormValues = z.infer<typeof sponsorshipFormSchema>;

interface PaginatedPatronsResponse {
  success: boolean;
  data: Patron[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminPatronsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedPatronId, setSelectedPatronId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isSponsorshipDialogOpen, setIsSponsorshipDialogOpen] = useState(false);
  const [isEditSponsorshipDialogOpen, setIsEditSponsorshipDialogOpen] = useState(false);
  const [editingSponsorshipId, setEditingSponsorshipId] = useState<string | null>(null);
  const [deletePatronId, setDeletePatronId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Vérifier les permissions - super-admin uniquement
  const isSuperAdmin = user?.role === "super_admin";

  // Queries
  const { data: patronsResponse, isLoading: patronsLoading } = useQuery<PaginatedPatronsResponse>({
    queryKey: ["/api/patrons", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/patrons?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch patrons');
      return res.json();
    },
    enabled: isSuperAdmin,
  });

  const patrons = patronsResponse?.data || [];
  const total = patronsResponse?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const { data: selectedPatron, isLoading: patronLoading } = useQuery<Patron>({
    queryKey: [`/api/patrons/${selectedPatronId}`],
    enabled: isSuperAdmin && !!selectedPatronId,
  });

  const { data: donations = [], isLoading: donationsLoading } = useQuery<PatronDonation[]>({
    queryKey: [`/api/patrons/${selectedPatronId}/donations`],
    enabled: isSuperAdmin && !!selectedPatronId,
  });

  const { data: updates = [], isLoading: updatesLoading } = useQuery<PatronUpdate[]>({
    queryKey: [`/api/patrons/${selectedPatronId}/updates`],
    enabled: isSuperAdmin && !!selectedPatronId,
  });

  const { data: sponsorships = [], isLoading: sponsorshipsLoading } = useQuery<EventSponsorship[]>({
    queryKey: [`/api/patrons/${selectedPatronId}/sponsorships`],
    enabled: isSuperAdmin && !!selectedPatronId,
  });

  const { data: eventsResponse } = useQuery<{ data: Event[] }>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
    enabled: isSuperAdmin,
  });

  const events = eventsResponse?.data || [];

  // Récupérer la liste des membres pour le champ prescripteur
  const { data: membersResponse } = useQuery<{ data: Array<{ id: string; firstName: string; lastName: string; email: string; company: string | null }> }>({
    queryKey: ["/api/members", { limit: 1000 }],
    queryFn: async () => {
      const res = await fetch("/api/members?limit=1000");
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
    enabled: isSuperAdmin,
  });

  const members = membersResponse?.data || [];

  // Filtrage local des mécènes
  const filteredPatrons = useMemo(() => {
    if (!searchQuery.trim()) return patrons;
    const query = searchQuery.toLowerCase();
    return patrons.filter(
      (patron) =>
        patron.firstName.toLowerCase().includes(query) ||
        patron.lastName.toLowerCase().includes(query) ||
        patron.email.toLowerCase().includes(query) ||
        patron.company?.toLowerCase().includes(query)
    );
  }, [patrons, searchQuery]);

  // Forms
  const patronForm = useForm<PatronFormValues>({
    resolver: zodResolver(patronFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
      role: "",
      notes: "",
      referrerId: "",
    },
  });

  const donationForm = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      amount: 0,
      donatedAt: new Date().toISOString().split('T')[0],
      occasion: "",
    },
  });

  const updateForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      type: "meeting",
      subject: "",
      date: new Date().toISOString().split('T')[0],
      startTime: "",
      duration: undefined,
      description: "",
      notes: "",
    },
  });

  const sponsorshipForm = useForm<SponsorshipFormValues>({
    resolver: zodResolver(sponsorshipFormSchema),
    defaultValues: {
      eventId: "",
      level: "partner",
      amount: 0,
      benefits: "",
      isPubliclyVisible: true,
      status: "proposed",
    },
  });

  // Mutations
  const createPatronMutation = useMutation({
    mutationFn: (data: PatronFormValues) => apiRequest("POST", "/api/patrons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patrons"] });
      setIsCreateDialogOpen(false);
      patronForm.reset();
      toast({ title: "Mécène créé avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le mécène",
        variant: "destructive",
      });
    },
  });

  const updatePatronMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatronFormValues }) =>
      apiRequest("PATCH", `/api/patrons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patrons"] });
      queryClient.invalidateQueries({ queryKey: [`/api/patrons/${selectedPatronId}`] });
      setIsEditDialogOpen(false);
      toast({ title: "Mécène modifié avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le mécène",
        variant: "destructive",
      });
    },
  });

  const deletePatronMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/patrons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patrons"] });
      setSelectedPatronId(null);
      setDeletePatronId(null);
      toast({ title: "Mécène supprimé avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le mécène",
        variant: "destructive",
      });
    },
  });

  const addDonationMutation = useMutation({
    mutationFn: (data: DonationFormValues) => {
      // Convertir le montant en centimes
      const amountInCents = Math.round(data.amount * 100);
      return apiRequest("POST", `/api/patrons/${selectedPatronId}/donations`, {
        ...data,
        amount: amountInCents,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patrons/${selectedPatronId}/donations`] });
      setIsDonationDialogOpen(false);
      donationForm.reset();
      toast({ title: "Don enregistré avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer le don",
        variant: "destructive",
      });
    },
  });

  const addUpdateMutation = useMutation({
    mutationFn: (data: UpdateFormValues) => {
      return apiRequest("POST", `/api/patrons/${selectedPatronId}/updates`, {
        ...data,
        createdBy: user?.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patrons/${selectedPatronId}/updates`] });
      setIsUpdateDialogOpen(false);
      updateForm.reset({
        type: "meeting",
        subject: "",
        date: new Date().toISOString().split('T')[0],
        startTime: "",
        duration: undefined,
        description: "",
        notes: "",
      });
      toast({ title: "Actualité ajoutée avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'actualité",
        variant: "destructive",
      });
    },
  });

  const deleteUpdateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/patron-updates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patrons/${selectedPatronId}/updates`] });
      toast({ title: "Actualité supprimée avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'actualité",
        variant: "destructive",
      });
    },
  });

  const addSponsorshipMutation = useMutation({
    mutationFn: (data: SponsorshipFormValues) => {
      const amountInCents = Math.round(data.amount * 100);
      return apiRequest("POST", `/api/patrons/${selectedPatronId}/sponsorships`, {
        ...data,
        amount: amountInCents,
        patronId: selectedPatronId,
        proposedByAdminEmail: user?.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patrons/${selectedPatronId}/sponsorships`] });
      setIsSponsorshipDialogOpen(false);
      sponsorshipForm.reset();
      toast({ title: "Sponsoring ajouté avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le sponsoring",
        variant: "destructive",
      });
    },
  });

  const updateSponsorshipMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SponsorshipFormValues }) => {
      const amountInCents = Math.round(data.amount * 100);
      return apiRequest("PATCH", `/api/sponsorships/${id}`, {
        ...data,
        amount: amountInCents,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patrons/${selectedPatronId}/sponsorships`] });
      setIsEditSponsorshipDialogOpen(false);
      setEditingSponsorshipId(null);
      sponsorshipForm.reset();
      toast({ title: "Sponsoring modifié avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le sponsoring",
        variant: "destructive",
      });
    },
  });

  const deleteSponsorshipMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/sponsorships/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patrons/${selectedPatronId}/sponsorships`] });
      toast({ title: "Sponsoring supprimé avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le sponsoring",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleCreatePatron = (data: PatronFormValues) => {
    createPatronMutation.mutate(data);
  };

  const handleEditPatron = () => {
    if (!selectedPatron) return;
    patronForm.reset({
      firstName: selectedPatron.firstName,
      lastName: selectedPatron.lastName,
      email: selectedPatron.email,
      company: selectedPatron.company || "",
      phone: selectedPatron.phone || "",
      role: selectedPatron.role || "",
      notes: selectedPatron.notes || "",
      referrerId: selectedPatron.referrerId || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePatron = (data: PatronFormValues) => {
    if (!selectedPatronId) return;
    updatePatronMutation.mutate({ id: selectedPatronId, data });
  };

  const handleDeletePatron = () => {
    if (!deletePatronId) return;
    deletePatronMutation.mutate(deletePatronId);
  };

  const handleAddDonation = (data: DonationFormValues) => {
    addDonationMutation.mutate(data);
  };

  const handleAddUpdate = (data: UpdateFormValues) => {
    addUpdateMutation.mutate(data);
  };

  const handleAddSponsorship = (data: SponsorshipFormValues) => {
    addSponsorshipMutation.mutate(data);
  };

  const handleEditSponsorship = (sponsorship: EventSponsorship) => {
    sponsorshipForm.reset({
      eventId: sponsorship.eventId,
      level: sponsorship.level,
      amount: sponsorship.amount / 100,
      benefits: sponsorship.benefits || "",
      isPubliclyVisible: sponsorship.isPubliclyVisible,
      status: sponsorship.status,
    });
    setEditingSponsorshipId(sponsorship.id);
    setIsEditSponsorshipDialogOpen(true);
  };

  const handleUpdateSponsorship = (data: SponsorshipFormValues) => {
    if (!editingSponsorshipId) return;
    updateSponsorshipMutation.mutate({ id: editingSponsorshipId, data });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  const getUpdateTypeLabel = (type: string) => {
    const labels = {
      meeting: "Réunion",
      email: "Email",
      call: "Appel",
      lunch: "Déjeuner",
      event: "Événement",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getUpdateTypeIcon = (type: string) => {
    const icons = {
      meeting: Calendar,
      email: Mail,
      call: Phone,
      lunch: Coffee,
      event: Star,
    };
    const Icon = icons[type as keyof typeof icons] || Calendar;
    return <Icon className="h-4 w-4" />;
  };

  const getSponsorshipLevelLabel = (level: string) => {
    const labels = {
      platinum: "Platine",
      gold: "Or",
      silver: "Argent",
      bronze: "Bronze",
      partner: "Partenaire",
    };
    return labels[level as keyof typeof labels] || level;
  };

  const getSponsorshipLevelBadgeClass = (level: string) => {
    const classes = {
      platinum: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
      gold: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      silver: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
      bronze: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      partner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return classes[level as keyof typeof classes] || "";
  };

  const getSponsorshipStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants = {
      proposed: "secondary" as const,
      confirmed: "default" as const,
      completed: "outline" as const,
      cancelled: "destructive" as const,
    };
    return variants[status as keyof typeof variants] || "secondary";
  };

  const getSponsorshipStatusLabel = (status: string) => {
    const labels = {
      proposed: "Proposé",
      confirmed: "Confirmé",
      completed: "Réalisé",
      cancelled: "Annulé",
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (patronsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Cette page est réservée aux super-administrateurs uniquement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/admin")} data-testid="button-back-admin">
              Retour au panneau d'administration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Liste des mécènes */}
          <div className="lg:w-2/5">
            <Card>
              <CardHeader>
                <CardTitle>Mécènes ({filteredPatrons.length})</CardTitle>
                <CardDescription>Gérer les relations avec les entreprises</CardDescription>
                <div className="flex gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un mécène..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-patron"
                    />
                  </div>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    data-testid="button-create-patron"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {filteredPatrons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "Aucun mécène trouvé" : "Aucun mécène enregistré"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPatrons.map((patron) => (
                      <div
                        key={patron.id}
                        onClick={() => setSelectedPatronId(patron.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedPatronId === patron.id
                            ? "bg-accent border-cjd-green"
                            : "hover:bg-gray-50"
                        }`}
                        data-testid={`patron-item-${patron.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">
                              {patron.firstName} {patron.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {patron.company || "Particulier"}
                            </div>
                            {patron.role && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {patron.role}
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant={patron.status === 'active' ? 'default' : 'secondary'}
                            className={patron.status === 'active' ? 'bg-success-light text-success-dark' : 'bg-warning-light text-warning-dark'}
                            data-testid={`badge-patron-status-${patron.id}`}
                          >
                            {patron.status === 'active' ? 'Actif' : 'Proposition'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {!patronsLoading && patrons && patrons.length > 0 && totalPages > 1 && (
                  <div className="mt-4">
                    <SimplePagination
                      currentPage={page}
                      totalPages={totalPages}
                      totalItems={total}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Détails du mécène sélectionné */}
          <div className="lg:w-3/5">
            {selectedPatronId && selectedPatron ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle data-testid="patron-name">
                        {selectedPatron.firstName} {selectedPatron.lastName}
                      </CardTitle>
                      <CardDescription data-testid="patron-company">
                        {selectedPatron.company || "Particulier"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditPatron}
                        data-testid="button-edit-patron"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Éditer
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletePatronId(selectedPatronId)}
                        data-testid="button-delete-patron"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {patronLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Tabs defaultValue="info" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="info" data-testid="tab-info">
                          Informations
                        </TabsTrigger>
                        <TabsTrigger value="donations" data-testid="tab-donations">
                          Dons ({donations.length})
                        </TabsTrigger>
                        <TabsTrigger value="updates" data-testid="tab-updates">
                          Actualités ({updates.length})
                        </TabsTrigger>
                        <TabsTrigger value="sponsorships" data-testid="tab-sponsorships">
                          Sponsorings ({sponsorships.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="info" className="space-y-4">
                        {selectedPatron.status === 'proposed' && selectedPatron.createdBy && (
                          <div className="mb-4 p-3 bg-warning-light rounded-lg border-l-4 border-warning">
                            <p className="text-sm text-warning-dark">
                              <strong>Mécène proposé par:</strong> {selectedPatron.createdBy}
                            </p>
                          </div>
                        )}
                        <div className="grid gap-4">
                          {selectedPatron.role && (
                            <div className="flex items-start gap-3">
                              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="font-medium text-sm">Fonction</div>
                                <div data-testid="patron-role">{selectedPatron.role}</div>
                              </div>
                            </div>
                          )}
                          {selectedPatron.company && (
                            <div className="flex items-start gap-3">
                              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="font-medium text-sm">Société</div>
                                <div data-testid="patron-company-detail">{selectedPatron.company}</div>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">Email</div>
                              <div data-testid="patron-email">{selectedPatron.email}</div>
                            </div>
                          </div>
                          {selectedPatron.phone && (
                            <div className="flex items-start gap-3">
                              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="font-medium text-sm">Téléphone</div>
                                <div data-testid="patron-phone">{selectedPatron.phone}</div>
                              </div>
                            </div>
                          )}
                          {selectedPatron.notes && (
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="font-medium text-sm">Notes</div>
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="patron-notes">
                                  {selectedPatron.notes}
                                </div>
                              </div>
                            </div>
                          )}
                          {selectedPatron.referrer && (
                            <div className="flex items-start gap-3">
                              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="font-medium text-sm">Prescripteur</div>
                                <div data-testid="patron-referrer">
                                  {selectedPatron.referrer.firstName} {selectedPatron.referrer.lastName}
                                  {selectedPatron.referrer.company && ` (${selectedPatron.referrer.company})`}
                                </div>
                                <div className="text-sm text-muted-foreground" data-testid="patron-referrer-email">
                                  {selectedPatron.referrer.email}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="pt-4 border-t">
                            <div className="text-xs text-muted-foreground">
                              Ajouté le {formatDate(selectedPatron.createdAt)}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="donations" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Historique des dons</h3>
                          <Button
                            size="sm"
                            onClick={() => setIsDonationDialogOpen(true)}
                            data-testid="button-add-donation"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un don
                          </Button>
                        </div>
                        {donationsLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : donations.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucun don enregistré
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {donations.map((donation) => (
                              <div
                                key={donation.id}
                                className="p-4 border rounded-lg"
                                data-testid={`donation-${donation.id}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="font-medium flex items-center gap-2">
                                      <Euro className="h-4 w-4" />
                                      <span data-testid={`donation-amount-${donation.id}`}>
                                        {formatAmount(donation.amount)}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1" data-testid={`donation-occasion-${donation.id}`}>
                                      {donation.occasion}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span data-testid={`donation-date-${donation.id}`}>
                                        {formatDate(donation.donatedAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="updates" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Historique des actualités</h3>
                          <Button
                            size="sm"
                            onClick={() => setIsUpdateDialogOpen(true)}
                            data-testid="button-add-update"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                          </Button>
                        </div>
                        {updatesLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : updates.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucune actualité enregistrée
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {[...updates]
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((update) => (
                                <div
                                  key={update.id}
                                  className="p-4 border rounded-lg"
                                  data-testid={`update-${update.id}`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        {getUpdateTypeIcon(update.type)}
                                        <span className="font-medium text-sm" data-testid={`update-type-${update.id}`}>
                                          {getUpdateTypeLabel(update.type)}
                                        </span>
                                      </div>
                                      <div className="font-medium" data-testid={`update-subject-${update.id}`}>
                                        {update.subject}
                                      </div>
                                      <div className="text-sm text-muted-foreground mt-1">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-3 w-3" />
                                          <span data-testid={`update-date-${update.id}`}>
                                            {formatDate(update.date)}
                                          </span>
                                          {update.startTime && (
                                            <span data-testid={`update-time-${update.id}`}>
                                              à {update.startTime}
                                            </span>
                                          )}
                                          {update.duration && (
                                            <span data-testid={`update-duration-${update.id}`}>
                                              ({update.duration} min)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteUpdateMutation.mutate(update.id)}
                                      data-testid={`button-delete-update-${update.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="text-sm mt-2" data-testid={`update-description-${update.id}`}>
                                    {update.description}
                                  </div>
                                  {update.notes && (
                                    <div className="text-sm text-muted-foreground mt-2 border-t pt-2" data-testid={`update-notes-${update.id}`}>
                                      <strong>Notes:</strong> {update.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="sponsorships" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Sponsorings d'événements</h3>
                          <Button
                            size="sm"
                            onClick={() => setIsSponsorshipDialogOpen(true)}
                            data-testid="button-add-sponsorship"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Nouveau sponsoring
                          </Button>
                        </div>
                        {sponsorshipsLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : sponsorships.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucun sponsoring enregistré
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {sponsorships.map((sponsorship) => (
                              <div
                                key={sponsorship.id}
                                className="p-4 border rounded-lg"
                                data-testid={`sponsorship-${sponsorship.id}`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="font-medium mb-1" data-testid={`sponsorship-event-${sponsorship.id}`}>
                                      {sponsorship.event?.title || "Événement inconnu"}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge 
                                        className={getSponsorshipLevelBadgeClass(sponsorship.level)}
                                        data-testid={`sponsorship-level-${sponsorship.id}`}
                                      >
                                        {getSponsorshipLevelLabel(sponsorship.level)}
                                      </Badge>
                                      <Badge 
                                        variant={getSponsorshipStatusBadgeVariant(sponsorship.status)}
                                        data-testid={`sponsorship-status-${sponsorship.id}`}
                                      >
                                        {getSponsorshipStatusLabel(sponsorship.status)}
                                      </Badge>
                                      {sponsorship.isPubliclyVisible ? (
                                        <Eye className="h-4 w-4 text-green-600" data-testid={`sponsorship-visible-${sponsorship.id}`} />
                                      ) : (
                                        <EyeOff className="h-4 w-4 text-gray-400" data-testid={`sponsorship-hidden-${sponsorship.id}`} />
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                          <Euro className="h-3 w-3" />
                                          <span data-testid={`sponsorship-amount-${sponsorship.id}`}>
                                            {formatAmount(sponsorship.amount)}
                                          </span>
                                        </div>
                                        {sponsorship.event?.date && (
                                          <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span data-testid={`sponsorship-date-${sponsorship.id}`}>
                                              {formatDate(sponsorship.event.date)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {sponsorship.benefits && (
                                      <div className="text-sm mt-2 text-muted-foreground" data-testid={`sponsorship-benefits-${sponsorship.id}`}>
                                        <strong>Contreparties:</strong> {sponsorship.benefits}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditSponsorship(sponsorship)}
                                      data-testid={`button-edit-sponsorship-${sponsorship.id}`}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteSponsorshipMutation.mutate(sponsorship.id)}
                                      data-testid={`button-delete-sponsorship-${sponsorship.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un mécène pour voir les détails</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Dialog: Créer un mécène */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau mécène</DialogTitle>
            <DialogDescription>
              Ajouter un nouveau mécène à la base de données
            </DialogDescription>
          </DialogHeader>
          <Form {...patronForm}>
            <form onSubmit={patronForm.handleSubmit(handleCreatePatron)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={patronForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-firstname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={patronForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-lastname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={patronForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={patronForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Société</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={patronForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonction</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-role" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={patronForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={patronForm.control}
                name="referrerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prescripteur (membre)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-referrer">
                          <SelectValue placeholder="Sélectionner un membre..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Aucun prescripteur</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                            {member.company ? ` (${member.company})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={patronForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Informations complémentaires..."
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-create"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createPatronMutation.isPending}
                  data-testid="button-submit-create"
                >
                  {createPatronMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Créer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Éditer un mécène */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le mécène</DialogTitle>
            <DialogDescription>
              Mettre à jour les informations du mécène
            </DialogDescription>
          </DialogHeader>
          <Form {...patronForm}>
            <form onSubmit={patronForm.handleSubmit(handleUpdatePatron)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={patronForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-firstname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={patronForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-lastname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={patronForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-edit-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={patronForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Société</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-company" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={patronForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonction</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-role" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={patronForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={patronForm.control}
                name="referrerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prescripteur (membre)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-referrer">
                          <SelectValue placeholder="Sélectionner un membre..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Aucun prescripteur</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName}
                            {member.company ? ` (${member.company})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={patronForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Informations complémentaires..."
                        data-testid="input-edit-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updatePatronMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updatePatronMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ajouter un don */}
      <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un don</DialogTitle>
            <DialogDescription>
              Ajouter un nouveau don pour ce mécène
            </DialogDescription>
          </DialogHeader>
          <Form {...donationForm}>
            <form onSubmit={donationForm.handleSubmit(handleAddDonation)} className="space-y-4">
              <FormField
                control={donationForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (€) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-donation-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="donatedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date du don *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-donation-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="occasion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occasion *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Événement, projet, campagne..."
                        data-testid="input-donation-occasion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDonationDialogOpen(false)}
                  data-testid="button-cancel-donation"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={addDonationMutation.isPending}
                  data-testid="button-submit-donation"
                >
                  {addDonationMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ajouter une actualité */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une actualité</DialogTitle>
            <DialogDescription>
              Enregistrer un contact ou une actualité pour ce mécène
            </DialogDescription>
          </DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(handleAddUpdate)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-update-type">
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="meeting">Réunion</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="call">Appel</SelectItem>
                        <SelectItem value="lunch">Déjeuner</SelectItem>
                        <SelectItem value="event">Événement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sujet *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Titre ou sujet de l'actualité"
                        data-testid="input-update-subject"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          data-testid="input-update-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de début</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          data-testid="input-update-starttime"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={updateForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (en minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ""}
                        placeholder="Ex: 60"
                        data-testid="input-update-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Détails de l'actualité ou du contact..."
                        data-testid="input-update-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Notes additionnelles (optionnel)..."
                        data-testid="input-update-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                  data-testid="button-cancel-update"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={addUpdateMutation.isPending}
                  data-testid="button-submit-update"
                >
                  {addUpdateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Créer un sponsoring */}
      <Dialog open={isSponsorshipDialogOpen} onOpenChange={setIsSponsorshipDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau sponsoring</DialogTitle>
            <DialogDescription>
              Ajouter un sponsoring d'événement pour ce mécène
            </DialogDescription>
          </DialogHeader>
          <Form {...sponsorshipForm}>
            <form onSubmit={sponsorshipForm.handleSubmit(handleAddSponsorship)} className="space-y-4">
              <FormField
                control={sponsorshipForm.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Événement *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-event">
                          <SelectValue placeholder="Sélectionner un événement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id} data-testid={`event-option-${event.id}`}>
                            {event.title} - {formatDate(event.date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={sponsorshipForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-level">
                            <SelectValue placeholder="Sélectionner un niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="platinum" data-testid="level-platinum">Platine</SelectItem>
                          <SelectItem value="gold" data-testid="level-gold">Or</SelectItem>
                          <SelectItem value="silver" data-testid="level-silver">Argent</SelectItem>
                          <SelectItem value="bronze" data-testid="level-bronze">Bronze</SelectItem>
                          <SelectItem value="partner" data-testid="level-partner">Partenaire</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sponsorshipForm.control}
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
                          placeholder="Ex: 1000.00"
                          data-testid="input-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={sponsorshipForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="proposed" data-testid="status-proposed">Proposé</SelectItem>
                        <SelectItem value="confirmed" data-testid="status-confirmed">Confirmé</SelectItem>
                        <SelectItem value="completed" data-testid="status-completed">Réalisé</SelectItem>
                        <SelectItem value="cancelled" data-testid="status-cancelled">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={sponsorshipForm.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contreparties</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Décrire les contreparties offertes au mécène..."
                        data-testid="input-benefits"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={sponsorshipForm.control}
                name="isPubliclyVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-visible"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Visibilité publique
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Le sponsoring sera visible publiquement sur la page de l'événement
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSponsorshipDialogOpen(false)}
                  data-testid="button-cancel-sponsorship"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={addSponsorshipMutation.isPending}
                  data-testid="button-submit-sponsorship"
                >
                  {addSponsorshipMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Modifier un sponsoring */}
      <Dialog open={isEditSponsorshipDialogOpen} onOpenChange={setIsEditSponsorshipDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le sponsoring</DialogTitle>
            <DialogDescription>
              Modifier les informations du sponsoring
            </DialogDescription>
          </DialogHeader>
          <Form {...sponsorshipForm}>
            <form onSubmit={sponsorshipForm.handleSubmit(handleUpdateSponsorship)} className="space-y-4">
              <FormField
                control={sponsorshipForm.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Événement *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-event">
                          <SelectValue placeholder="Sélectionner un événement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title} - {formatDate(event.date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={sponsorshipForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-level">
                            <SelectValue placeholder="Sélectionner un niveau" />
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
                  control={sponsorshipForm.control}
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
                          placeholder="Ex: 1000.00"
                          data-testid="input-edit-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={sponsorshipForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-status">
                          <SelectValue placeholder="Sélectionner un statut" />
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
                control={sponsorshipForm.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contreparties</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Décrire les contreparties offertes au mécène..."
                        data-testid="input-edit-benefits"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={sponsorshipForm.control}
                name="isPubliclyVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-edit-visible"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Visibilité publique
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Le sponsoring sera visible publiquement sur la page de l'événement
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditSponsorshipDialogOpen(false);
                    setEditingSponsorshipId(null);
                  }}
                  data-testid="button-cancel-edit-sponsorship"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={updateSponsorshipMutation.isPending}
                  data-testid="button-submit-edit-sponsorship"
                >
                  {updateSponsorshipMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmer suppression */}
      <AlertDialog open={!!deletePatronId} onOpenChange={() => setDeletePatronId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce mécène ? Cette action est irréversible et
              supprimera également tous les dons et propositions associés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePatron}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deletePatronMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
