import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
import { Loader2, Search, Plus, Edit, Trash2, Euro, Calendar, User, Building2, Phone, Mail, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

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

type IdeaPatronProposal = {
  id: string;
  ideaId: string;
  patronId: string;
  proposedByAdminEmail: string;
  proposedAt: Date | string;
  status: "proposed" | "contacted" | "declined" | "converted";
  comments: string | null;
  updatedAt: Date | string;
  idea?: {
    id: string;
    title: string;
    description: string | null;
  };
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
});

const donationFormSchema = z.object({
  amount: z.number().min(0, "Le montant ne peut pas être négatif"),
  donatedAt: z.string(),
  occasion: z.string().min(3, "L'occasion doit contenir au moins 3 caractères"),
});

type PatronFormValues = z.infer<typeof patronFormSchema>;
type DonationFormValues = z.infer<typeof donationFormSchema>;

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

  const { data: proposals = [], isLoading: proposalsLoading } = useQuery<IdeaPatronProposal[]>({
    queryKey: [`/api/patrons/${selectedPatronId}/proposals`],
    enabled: isSuperAdmin && !!selectedPatronId,
  });

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

  const updateProposalMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/proposals/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/patrons/${selectedPatronId}/proposals`] });
      toast({ title: "Statut mis à jour" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      proposed: "Proposé",
      contacted: "Contacté",
      declined: "Refusé",
      converted: "Converti",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      proposed: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      declined: "bg-red-100 text-red-800",
      converted: "bg-green-100 text-green-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
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
      <header className="bg-cjd-green text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestion des Mécènes</h1>
              <p className="text-green-100">CRM - Relations entreprises</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setLocation("/admin")}
              data-testid="button-back-admin"
            >
              Retour admin
            </Button>
          </div>
        </div>
      </header>

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
                            className={patron.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
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
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="info" data-testid="tab-info">
                          Informations
                        </TabsTrigger>
                        <TabsTrigger value="donations" data-testid="tab-donations">
                          Dons ({donations.length})
                        </TabsTrigger>
                        <TabsTrigger value="proposals" data-testid="tab-proposals">
                          Propositions ({proposals.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="info" className="space-y-4">
                        {selectedPatron.status === 'proposed' && selectedPatron.createdBy && (
                          <div className="mb-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                            <p className="text-sm text-orange-800">
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

                      <TabsContent value="proposals" className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-4">Idées proposées</h3>
                          {proposalsLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          ) : proposals.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              Aucune proposition enregistrée
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {proposals.map((proposal) => (
                                <div
                                  key={proposal.id}
                                  className="p-4 border rounded-lg"
                                  data-testid={`proposal-${proposal.id}`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      {proposal.idea && (
                                        <div className="font-medium" data-testid={`proposal-idea-title-${proposal.id}`}>
                                          {proposal.idea.title}
                                        </div>
                                      )}
                                      <div className="text-sm text-muted-foreground">
                                        Proposé le {formatDate(proposal.proposedAt)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-3">
                                    <span className="text-sm">Statut :</span>
                                    <Select
                                      value={proposal.status}
                                      onValueChange={(status) =>
                                        updateProposalMutation.mutate({ id: proposal.id, status })
                                      }
                                      data-testid={`select-proposal-status-${proposal.id}`}
                                    >
                                      <SelectTrigger className={`w-[140px] ${getStatusColor(proposal.status)}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="proposed">Proposé</SelectItem>
                                        <SelectItem value="contacted">Contacté</SelectItem>
                                        <SelectItem value="declined">Refusé</SelectItem>
                                        <SelectItem value="converted">Converti</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {proposal.comments && (
                                    <div className="mt-2 text-sm text-muted-foreground" data-testid={`proposal-comments-${proposal.id}`}>
                                      {proposal.comments}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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
