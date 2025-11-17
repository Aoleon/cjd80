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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Euro, Award, TrendingUp, Calendar, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

// Types
type Patron = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
};

type Event = {
  id: string;
  title: string;
  date: Date | string;
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
  patron?: Patron;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type SponsorshipStats = {
  total: number;
  totalAmount: number;
  byLevel: Record<string, number>;
  byStatus: Record<string, number>;
};

// Helper functions
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

const getSponsorshipLevelBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    platinum: "default",
    gold: "default",
    silver: "secondary",
    bronze: "outline",
    partner: "secondary",
  };
  return variants[level] || "default";
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

// Form schemas
const sponsorshipFormSchema = z.object({
  eventId: z.string().min(1, "Veuillez sélectionner un événement"),
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

type SponsorshipFormValues = z.infer<typeof sponsorshipFormSchema>;

export default function AdminSponsorshipsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSponsorshipId, setEditingSponsorshipId] = useState<string | null>(null);
  const [deleteSponsorshipId, setDeleteSponsorshipId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  // Vérifier les permissions - super-admin uniquement
  const isSuperAdmin = user?.role === "super_admin";

  // Queries
  const { data: sponsorshipsResponse, isLoading: sponsorshipsLoading } = useQuery<{ success: boolean; data: EventSponsorship[] }>({
    queryKey: ["/api/sponsorships"],
    enabled: isSuperAdmin,
  });

  const sponsorships = sponsorshipsResponse?.data || [];

  const { data: statsResponse, isLoading: statsLoading } = useQuery<{ success: boolean; data: SponsorshipStats }>({
    queryKey: ["/api/sponsorships/stats"],
    enabled: isSuperAdmin,
  });

  const stats = statsResponse?.data;

  const { data: eventsResponse } = useQuery<{ data: Event[] }>({
    queryKey: ["/api/events"],
    enabled: isSuperAdmin,
  });

  const events = eventsResponse?.data || [];

  const { data: patronsResponse } = useQuery<{ data: Patron[]; total: number }>({
    queryKey: ["/api/patrons", 1, 1000],
    queryFn: async () => {
      const res = await fetch("/api/patrons?page=1&limit=1000");
      if (!res.ok) throw new Error('Failed to fetch patrons');
      return res.json();
    },
    enabled: isSuperAdmin,
  });

  const patrons = patronsResponse?.data || [];

  // Filtrage des sponsorships
  const filteredSponsorships = useMemo(() => {
    return sponsorships.filter((sponsorship) => {
      if (filterStatus !== "all" && sponsorship.status !== filterStatus) return false;
      if (filterLevel !== "all" && sponsorship.level !== filterLevel) return false;
      return true;
    });
  }, [sponsorships, filterStatus, filterLevel]);

  // Forms
  const sponsorshipForm = useForm<SponsorshipFormValues>({
    resolver: zodResolver(sponsorshipFormSchema),
    defaultValues: {
      eventId: "",
      patronId: "",
      level: "partner",
      amount: 0,
      benefits: "",
      isPubliclyVisible: true,
      status: "proposed",
    },
  });

  // Mutations
  const createSponsorshipMutation = useMutation({
    mutationFn: (data: SponsorshipFormValues) => {
      const amountInCents = Math.round(data.amount * 100);
      return apiRequest("POST", `/api/events/${data.eventId}/sponsorships`, {
        ...data,
        amount: amountInCents,
        proposedByAdminEmail: user?.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships/stats"] });
      setIsCreateDialogOpen(false);
      sponsorshipForm.reset();
      toast({ title: "Sponsoring créé avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le sponsoring",
        variant: "destructive",
      });
    },
  });

  const updateSponsorshipMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SponsorshipFormValues> }) => {
      const payload = { ...data };
      if (data.amount !== undefined) {
        payload.amount = Math.round(data.amount * 100);
      }
      return apiRequest("PATCH", `/api/sponsorships/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships/stats"] });
      setIsEditDialogOpen(false);
      setEditingSponsorshipId(null);
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
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sponsorships/stats"] });
      setDeleteSponsorshipId(null);
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
  const handleCreateSponsorship = (data: SponsorshipFormValues) => {
    createSponsorshipMutation.mutate(data);
  };

  const handleEditSponsorship = (data: SponsorshipFormValues) => {
    if (!editingSponsorshipId) return;
    updateSponsorshipMutation.mutate({ id: editingSponsorshipId, data });
  };

  const openEditDialog = (sponsorship: EventSponsorship) => {
    setEditingSponsorshipId(sponsorship.id);
    sponsorshipForm.reset({
      eventId: sponsorship.eventId,
      patronId: sponsorship.patronId,
      level: sponsorship.level,
      amount: sponsorship.amount / 100,
      benefits: sponsorship.benefits || "",
      isPubliclyVisible: sponsorship.isPubliclyVisible,
      status: sponsorship.status,
    });
    setIsEditDialogOpen(true);
  };

  if (!isSuperAdmin) {
    return (
      <>
        <AdminHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Accès refusé</CardTitle>
              <CardDescription>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec statistiques */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-page-title">Gestion des Sponsorings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1" data-testid="text-page-subtitle">
                Vue d'ensemble et gestion centralisée des sponsorings d'événements
              </p>
            </div>
            <Button
              onClick={() => {
                sponsorshipForm.reset();
                setIsCreateDialogOpen(true);
              }}
              data-testid="button-create-sponsorship"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau sponsoring
            </Button>
          </div>

          {/* KPI Cards */}
          {statsLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card data-testid="card-stat-total">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total des sponsorings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" data-testid="text-stat-total">{stats.total}</div>
                </CardContent>
              </Card>

              <Card data-testid="card-stat-amount">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Montant total collecté
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success" data-testid="text-stat-amount">
                    {formatEuros(stats.totalAmount)}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-stat-by-level">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Par niveau
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.byLevel).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <Badge className={getSponsorshipLevelBadgeClass(level)} data-testid={`badge-level-${level}`}>
                          {getSponsorshipLevelLabel(level)}
                        </Badge>
                        <span className="text-sm font-medium" data-testid={`text-level-count-${level}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-stat-by-status">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Par statut
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <Badge variant={getSponsorshipStatusBadgeVariant(status)} data-testid={`badge-status-${status}`}>
                          {getSponsorshipStatusLabel(status)}
                        </Badge>
                        <span className="text-sm font-medium" data-testid={`text-status-count-${status}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Filtrer par statut</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger data-testid="select-filter-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="proposed">Proposé</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="completed">Réalisé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Filtrer par niveau</label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger data-testid="select-filter-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="platinum">Platine</SelectItem>
                    <SelectItem value="gold">Or</SelectItem>
                    <SelectItem value="silver">Argent</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="partner">Partenaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des sponsorings */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des sponsorings</CardTitle>
            <CardDescription>
              {filteredSponsorships.length} sponsoring{filteredSponsorships.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sponsorshipsLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredSponsorships.length === 0 ? (
              <div className="text-center py-12 text-gray-500" data-testid="text-no-sponsorships">
                Aucun sponsoring trouvé
              </div>
            ) : (
              <>
                {/* Vue desktop - Tableau */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Événement</TableHead>
                        <TableHead>Mécène</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Visibilité</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSponsorships.map((sponsorship) => (
                        <TableRow key={sponsorship.id} data-testid={`row-sponsorship-${sponsorship.id}`}>
                          <TableCell data-testid={`text-event-${sponsorship.id}`}>
                            {sponsorship.event?.title || "—"}
                          </TableCell>
                          <TableCell data-testid={`text-patron-${sponsorship.id}`}>
                            {sponsorship.patron
                              ? `${sponsorship.patron.firstName} ${sponsorship.patron.lastName}`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getSponsorshipLevelBadgeClass(sponsorship.level)}
                              data-testid={`badge-level-${sponsorship.id}`}
                            >
                              {getSponsorshipLevelLabel(sponsorship.level)}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-amount-${sponsorship.id}`}>
                            {formatEuros(sponsorship.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getSponsorshipStatusBadgeVariant(sponsorship.status)}
                              data-testid={`badge-status-${sponsorship.id}`}
                            >
                              {getSponsorshipStatusLabel(sponsorship.status)}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-visibility-${sponsorship.id}`}>
                            {sponsorship.isPubliclyVisible ? (
                              <Eye className="w-4 h-4 text-success" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(sponsorship)}
                                data-testid={`button-edit-${sponsorship.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteSponsorshipId(sponsorship.id)}
                                data-testid={`button-delete-${sponsorship.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-error" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Vue mobile - Cards */}
                <div className="md:hidden space-y-4">
                  {filteredSponsorships.map((sponsorship) => (
                    <Card key={sponsorship.id} data-testid={`card-mobile-sponsorship-${sponsorship.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg" data-testid={`text-mobile-event-${sponsorship.id}`}>
                              {sponsorship.event?.title || "—"}
                            </CardTitle>
                            <CardDescription data-testid={`text-mobile-patron-${sponsorship.id}`}>
                              {sponsorship.patron
                                ? `${sponsorship.patron.firstName} ${sponsorship.patron.lastName}`
                                : "—"}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(sponsorship)}
                              data-testid={`button-mobile-edit-${sponsorship.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteSponsorshipId(sponsorship.id)}
                              data-testid={`button-mobile-delete-${sponsorship.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-error" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Niveau</span>
                            <Badge
                              className={getSponsorshipLevelBadgeClass(sponsorship.level)}
                              data-testid={`badge-mobile-level-${sponsorship.id}`}
                            >
                              {getSponsorshipLevelLabel(sponsorship.level)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Montant</span>
                            <span className="font-medium" data-testid={`text-mobile-amount-${sponsorship.id}`}>
                              {formatEuros(sponsorship.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                            <Badge
                              variant={getSponsorshipStatusBadgeVariant(sponsorship.status)}
                              data-testid={`badge-mobile-status-${sponsorship.id}`}
                            >
                              {getSponsorshipStatusLabel(sponsorship.status)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Visibilité</span>
                            {sponsorship.isPubliclyVisible ? (
                              <Eye className="w-4 h-4 text-success" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de création */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create-sponsorship">
          <DialogHeader>
            <DialogTitle>Nouveau sponsoring</DialogTitle>
            <DialogDescription>
              Créer un nouveau sponsoring pour un événement
            </DialogDescription>
          </DialogHeader>
          <Form {...sponsorshipForm}>
            <form onSubmit={sponsorshipForm.handleSubmit(handleCreateSponsorship)} className="space-y-4">
              <FormField
                control={sponsorshipForm.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Événement</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-create-event">
                          <SelectValue placeholder="Sélectionner un événement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sponsorshipForm.control}
                name="patronId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mécène</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-create-patron">
                          <SelectValue placeholder="Sélectionner un mécène" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patrons.map((patron) => (
                          <SelectItem key={patron.id} value={patron.id}>
                            {patron.firstName} {patron.lastName} {patron.company ? `(${patron.company})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sponsorshipForm.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-create-level">
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
                control={sponsorshipForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-create-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sponsorshipForm.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contreparties / Bénéfices</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Logo sur l'affiche, mention lors de l'événement..."
                        data-testid="textarea-create-benefits"
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
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-create-visibility"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Affichage public</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sponsorshipForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-create-status">
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
                  disabled={createSponsorshipMutation.isPending}
                  data-testid="button-submit-create"
                >
                  {createSponsorshipMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Créer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-sponsorship">
          <DialogHeader>
            <DialogTitle>Modifier le sponsoring</DialogTitle>
            <DialogDescription>
              Modifier les informations du sponsoring
            </DialogDescription>
          </DialogHeader>
          <Form {...sponsorshipForm}>
            <form onSubmit={sponsorshipForm.handleSubmit(handleEditSponsorship)} className="space-y-4">
              <FormField
                control={sponsorshipForm.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Événement</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-event">
                          <SelectValue placeholder="Sélectionner un événement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sponsorshipForm.control}
                name="patronId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mécène</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-patron">
                          <SelectValue placeholder="Sélectionner un mécène" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patrons.map((patron) => (
                          <SelectItem key={patron.id} value={patron.id}>
                            {patron.firstName} {patron.lastName} {patron.company ? `(${patron.company})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sponsorshipForm.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-level">
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
                control={sponsorshipForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-edit-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sponsorshipForm.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contreparties / Bénéfices</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Logo sur l'affiche, mention lors de l'événement..."
                        data-testid="textarea-edit-benefits"
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
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-edit-visibility"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Affichage public</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={sponsorshipForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-status">
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
                  disabled={updateSponsorshipMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateSponsorshipMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!deleteSponsorshipId} onOpenChange={() => setDeleteSponsorshipId(null)}>
        <AlertDialogContent data-testid="dialog-delete-sponsorship">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce sponsoring ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSponsorshipId && deleteSponsorshipMutation.mutate(deleteSponsorshipId)}
              className="bg-error hover:bg-error-dark"
              data-testid="button-confirm-delete"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
