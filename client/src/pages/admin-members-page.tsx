import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { SimplePagination } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Loader2, 
  Search, 
  ArrowLeft, 
  User, 
  Lightbulb, 
  ThumbsUp, 
  Calendar, 
  Heart, 
  Save,
  TrendingUp,
  Activity as ActivityIcon,
  Euro,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { hasPermission, CJD_ROLES, CJD_ROLE_LABELS } from "@shared/schema";
import type { Member, MemberActivity, MemberSubscription } from "@shared/schema";
import { MemberTags } from "@/components/member-tags";
import { MemberTasks } from "@/components/member-tasks";
import { MemberRelations } from "@/components/member-relations";
import { MemberChatbot } from "@/components/member-chatbot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginatedMembersResponse {
  success: boolean;
  data: Member[];
  total: number;
  page: number;
  limit: number;
}

const updateMemberFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  company: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  cjdRole: z.string().optional(),
  notes: z.string().optional(),
});

type UpdateMemberFormValues = z.infer<typeof updateMemberFormSchema>;

const subscriptionFormSchema = z.object({
  amountInEuros: z.coerce.number().min(0.01, "Le montant doit être supérieur à 0"),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "La date de fin doit être après la date de début",
  path: ["endDate"],
});

export default function AdminMembersPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSubscriptionDialog, setShowAddSubscriptionDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'proposed'>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'recent' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const hasViewPermission = user && hasPermission(user.role, 'admin.view');

  const { data: membersResponse, isLoading: membersLoading } = useQuery<PaginatedMembersResponse>({
    queryKey: ["/api/admin/members", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/members?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
    enabled: !!hasViewPermission,
  });

  const members = membersResponse?.data || [];
  const total = membersResponse?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const { data: selectedMemberResponse, isLoading: memberLoading } = useQuery<{ success: boolean; data: Member }>({
    queryKey: ["/api/admin/members", selectedEmail],
    queryFn: async () => {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(selectedEmail!)}`);
      if (!res.ok) throw new Error('Failed to fetch member');
      return res.json();
    },
    enabled: !!hasViewPermission && !!selectedEmail,
  });

  const selectedMember = selectedMemberResponse?.data;

  const { data: activitiesResponse, isLoading: activitiesLoading } = useQuery<{ success: boolean; data: MemberActivity[] }>({
    queryKey: ["/api/admin/members", selectedEmail, "activities"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(selectedEmail!)}/activities`);
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    },
    enabled: !!hasViewPermission && !!selectedEmail,
  });

  const activities = activitiesResponse?.data || [];

  const { data: subscriptionsResponse, isLoading: subscriptionsLoading } = useQuery<{ success: boolean; data: MemberSubscription[] }>({
    queryKey: ["/api/admin/members", selectedEmail, "subscriptions"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(selectedEmail!)}/subscriptions`);
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      return res.json();
    },
    enabled: !!hasViewPermission && !!selectedEmail,
  });

  const subscriptions = subscriptionsResponse?.data || [];

  const filteredMembers = useMemo(() => {
    let result = members;

    // Filtre de recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (member) =>
          member.firstName.toLowerCase().includes(query) ||
          member.lastName.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.company?.toLowerCase().includes(query)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      result = result.filter((member) => member.status === statusFilter);
    }

    // Filtre par score d'engagement
    if (scoreFilter !== 'all') {
      result = result.filter((member) => {
        if (scoreFilter === 'high') return member.engagementScore >= 50;
        if (scoreFilter === 'medium') return member.engagementScore >= 10 && member.engagementScore < 50;
        if (scoreFilter === 'low') return member.engagementScore < 10;
        return true;
      });
    }

    // Filtre par activité récente
    if (activityFilter !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      result = result.filter((member) => {
        if (!member.lastActivityAt) return activityFilter === 'inactive';
        const lastActivity = new Date(member.lastActivityAt);
        
        if (activityFilter === 'recent') {
          return lastActivity >= thirtyDaysAgo;
        } else if (activityFilter === 'inactive') {
          return lastActivity < thirtyDaysAgo;
        }
        return true;
      });
    }

    return result;
  }, [members, searchQuery, statusFilter, scoreFilter, activityFilter]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => b.engagementScore - a.engagementScore);
  }, [filteredMembers]);

  const memberForm = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(updateMemberFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      phone: "",
      role: "",
      notes: "",
    },
  });

  const subscriptionForm = useForm<z.infer<typeof subscriptionFormSchema>>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      amountInEuros: 0,
      startDate: "",
      endDate: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateMemberFormValues) => {
      if (!selectedEmail) throw new Error("Aucun membre sélectionné");
      const res = await apiRequest("PATCH", `/api/admin/members/${selectedEmail}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", selectedEmail] });
      toast({ title: "Membre mis à jour avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le membre",
        variant: "destructive",
      });
    },
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: { amountInCents: number; startDate: string; endDate: string }) => {
      if (!selectedEmail) throw new Error("Aucun membre sélectionné");
      return apiRequest("POST", `/api/admin/members/${selectedEmail}/subscriptions`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", selectedEmail, "subscriptions"] });
      toast({
        title: "✅ Souscription ajoutée",
        description: "La souscription a été enregistrée avec succès",
      });
      setShowAddSubscriptionDialog(false);
      subscriptionForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("DELETE", `/api/admin/members/${email}`, undefined);
      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la suppression");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      setSelectedEmail(null);
      setShowDeleteDialog(false);
      toast({
        title: "Membre supprimé",
        description: "Le membre a été supprimé avec succès",
      });
    },
    onError: (error: Error) => {
      const errorMessages: Record<string, string> = {
        "Member not found": "Membre introuvable",
        "Membre introuvable": "Membre introuvable",
      };
      const errorMessage = errorMessages[error.message] || error.message || "Impossible de supprimer le membre";
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleMemberSelect = (email: string) => {
    setSelectedEmail(email);
    const member = members.find(m => m.email === email);
    if (member) {
      memberForm.reset({
        firstName: member.firstName,
        lastName: member.lastName,
        company: member.company || "",
        phone: member.phone || "",
        role: member.role || "",
        cjdRole: member.cjdRole || "",
        notes: member.notes || "",
      });
    }
  };

  const handleUpdateMember = (data: UpdateMemberFormValues) => {
    updateMutation.mutate(data);
  };

  const handleAddSubscription = subscriptionForm.handleSubmit((data) => {
    createSubscriptionMutation.mutate({
      amountInCents: Math.round(data.amountInEuros * 100),
      startDate: data.startDate,
      endDate: data.endDate,
    });
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 50) return "bg-success-light text-success-dark dark:bg-success-dark dark:text-success-light";
    if (score >= 20) return "bg-info-light text-info-dark dark:bg-info-dark dark:text-info-light";
    if (score >= 10) return "bg-warning-light text-warning-dark dark:bg-warning-dark dark:text-warning-light";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "idea_proposed":
        return <Lightbulb className="h-4 w-4" />;
      case "vote_cast":
        return <ThumbsUp className="h-4 w-4" />;
      case "event_registered":
        return <Calendar className="h-4 w-4" />;
      case "event_unregistered":
        return <Calendar className="h-4 w-4" />;
      case "patron_suggested":
        return <Heart className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      idea_proposed: "Idée proposée",
      vote_cast: "Vote effectué",
      event_registered: "Inscription événement",
      event_unregistered: "Désinscription événement",
      patron_suggested: "Mécène suggéré",
    };
    return labels[type] || type;
  };

  const getActivityBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      idea_proposed: "bg-info-light text-info-dark dark:bg-info-dark dark:text-info-light",
      vote_cast: "bg-info-light text-info-dark dark:bg-info-dark dark:text-info-light",
      event_registered: "bg-success-light text-success-dark dark:bg-success-dark dark:text-success-light",
      event_unregistered: "bg-error-light text-error-dark dark:bg-error-dark dark:text-error-light",
      patron_suggested: "bg-info-light text-info-dark dark:bg-info-dark dark:text-info-light",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const formatDate = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  };

  const formatFullDate = (date: Date | string) => {
    return format(new Date(date), "dd MMMM yyyy", { locale: fr });
  };

  const formatEuros = (cents: number) => `${(cents / 100).toFixed(2)} €`;

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  const activityStats = useMemo(() => {
    if (!activities.length) {
      return {
        ideasProposed: 0,
        votesCast: 0,
        eventsRegistered: 0,
        patronsSuggested: 0,
      };
    }

    return {
      ideasProposed: activities.filter(a => a.activityType === "idea_proposed").length,
      votesCast: activities.filter(a => a.activityType === "vote_cast").length,
      eventsRegistered: activities.filter(a => a.activityType === "event_registered").length,
      patronsSuggested: activities.filter(a => a.activityType === "patron_suggested").length,
    };
  }, [activities]);

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Membres ({sortedMembers.length})
                </CardTitle>
                <CardDescription>Liste des membres de la communauté</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, email ou société..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-members"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {/* Section des filtres */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {/* Filtre Statut */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Statut:</span>
                    <div className="flex gap-1">
                      <Button
                        variant={statusFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('all')}
                        data-testid="filter-status-all"
                      >
                        Tous
                      </Button>
                      <Button
                        variant={statusFilter === 'active' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('active')}
                        data-testid="filter-status-active"
                      >
                        Actifs
                      </Button>
                      <Button
                        variant={statusFilter === 'proposed' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter('proposed')}
                        data-testid="filter-status-proposed"
                      >
                        Propositions
                      </Button>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="h-8" />

                  {/* Filtre Score d'engagement */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Score:</span>
                    <div className="flex gap-1">
                      <Button
                        variant={scoreFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setScoreFilter('all')}
                        data-testid="filter-score-all"
                      >
                        Tous
                      </Button>
                      <Button
                        variant={scoreFilter === 'high' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setScoreFilter('high')}
                        data-testid="filter-score-high"
                      >
                        Élevé (≥50)
                      </Button>
                      <Button
                        variant={scoreFilter === 'medium' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setScoreFilter('medium')}
                        data-testid="filter-score-medium"
                      >
                        Moyen (10-49)
                      </Button>
                      <Button
                        variant={scoreFilter === 'low' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setScoreFilter('low')}
                        data-testid="filter-score-low"
                      >
                        {"Faible (<10)"}
                      </Button>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="h-8" />

                  {/* Filtre Activité */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activité:</span>
                    <div className="flex gap-1">
                      <Button
                        variant={activityFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActivityFilter('all')}
                        data-testid="filter-activity-all"
                      >
                        Tous
                      </Button>
                      <Button
                        variant={activityFilter === 'recent' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActivityFilter('recent')}
                        data-testid="filter-activity-recent"
                      >
                        Actifs (30j)
                      </Button>
                      <Button
                        variant={activityFilter === 'inactive' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActivityFilter('inactive')}
                        data-testid="filter-activity-inactive"
                      >
                        Inactifs
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Compteur de résultats */}
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {sortedMembers.length} membre{sortedMembers.length > 1 ? 's' : ''} affiché{sortedMembers.length > 1 ? 's' : ''}
                  {(statusFilter !== 'all' || scoreFilter !== 'all' || activityFilter !== 'all' || searchQuery) && 
                    ` sur ${members.length} au total`}
                </div>

                <ScrollArea className="h-[600px]">
                  {sortedMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "Aucun membre trouvé" : "Aucun membre enregistré"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sortedMembers.map((member) => (
                        <div
                          key={member.email}
                          onClick={() => handleMemberSelect(member.email)}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedEmail === member.email
                              ? "bg-accent border-cjd-green dark:bg-accent dark:border-cjd-green"
                              : "hover:bg-gray-50 dark:hover:bg-gray-900"
                          }`}
                          data-testid={`card-member-${member.email}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {member.firstName} {member.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {member.email}
                              </div>
                              {member.company && (
                                <div className="text-xs text-muted-foreground mt-1 truncate">
                                  {member.company}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge 
                                variant={member.status === 'active' ? 'default' : 'secondary'}
                                className={member.status === 'active' ? 'bg-success-light text-success-dark dark:bg-success-dark dark:text-success-light' : 'bg-warning-light text-warning-dark dark:bg-warning-dark dark:text-warning-light'}
                                data-testid={`badge-status-${member.email}`}
                              >
                                {member.status === 'active' ? 'Actif' : 'Proposition'}
                              </Badge>
                              <Badge className={getScoreBadgeColor(member.engagementScore)} data-testid={`badge-engagement-${member.email}`}>
                                {member.engagementScore}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <span>{member.activityCount} activité{member.activityCount > 1 ? 's' : ''}</span>
                            <span>{formatDate(member.lastActivityAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {/* Pagination */}
                {!membersLoading && members && members.length > 0 && totalPages > 1 && (
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

          <div className="lg:w-3/5">
            {selectedEmail && selectedMember ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle data-testid="member-name">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </CardTitle>
                      <CardDescription data-testid="member-email">
                        {selectedMember.email}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getScoreBadgeColor(selectedMember.engagementScore)}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Score: {selectedMember.engagementScore}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {memberLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <Tabs defaultValue="info" className="w-full">
                      <TabsList className="grid w-full grid-cols-8">
                        <TabsTrigger value="info" data-testid="tab-info">
                          Informations
                        </TabsTrigger>
                        <TabsTrigger value="activity" data-testid="tab-activity">
                          Activité ({activities.length})
                        </TabsTrigger>
                        <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
                          Souscriptions
                        </TabsTrigger>
                        <TabsTrigger value="stats" data-testid="tab-stats">
                          Statistiques
                        </TabsTrigger>
                        <TabsTrigger value="tags" data-testid="tab-tags">
                          Tags
                        </TabsTrigger>
                        <TabsTrigger value="tasks" data-testid="tab-tasks">
                          Tâches
                        </TabsTrigger>
                        <TabsTrigger value="relations" data-testid="tab-relations">
                          Relations
                        </TabsTrigger>
                        <TabsTrigger value="chatbot" data-testid="tab-chatbot">
                          Chatbot
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="info" className="space-y-4">
                        {selectedMember.status === 'proposed' && selectedMember.proposedBy && (
                          <div className="mb-4 p-3 bg-warning-light dark:bg-warning-dark rounded-lg border-l-4 border-warning">
                            <p className="text-sm text-warning-dark dark:text-warning-light">
                              <strong>Membre proposé par:</strong> {selectedMember.proposedBy}
                            </p>
                          </div>
                        )}
                        <Form {...memberForm}>
                          <form onSubmit={memberForm.handleSubmit(handleUpdateMember)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={memberForm.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-member-firstname" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={memberForm.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-member-lastname" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <Input value={selectedMember.email} disabled data-testid="input-member-email" />
                              <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                            </FormItem>

                            <FormField
                              control={memberForm.control}
                              name="company"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Société</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-member-company" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={memberForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Téléphone</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-member-phone" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={memberForm.control}
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Fonction</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-member-role" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={memberForm.control}
                              name="cjdRole"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rôle CJD</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                                    value={field.value || "none"}
                                  >
                                    <FormControl>
                                      <SelectTrigger data-testid="select-cjd-role">
                                        <SelectValue placeholder="Sélectionner un rôle..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="none">Aucun rôle</SelectItem>
                                      {Object.entries(CJD_ROLE_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={CJD_ROLES[key as keyof typeof CJD_ROLES]}>
                                          {label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={memberForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} rows={4} data-testid="textarea-member-notes" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Separator />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Première activité</p>
                                <p className="font-medium">{formatFullDate(selectedMember.firstSeenAt)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Dernière activité</p>
                                <p className="font-medium">{formatDate(selectedMember.lastActivityAt)}</p>
                              </div>
                            </div>

                            <Button
                              type="submit"
                              disabled={updateMutation.isPending}
                              data-testid="button-save-member"
                              className="w-full"
                            >
                              {updateMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Enregistrement...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Sauvegarder les modifications
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>

                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="w-full mt-4"
                              data-testid="button-delete-member-trigger"
                              disabled={deleteMemberMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer le membre
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmer la suppression</DialogTitle>
                              <DialogDescription>
                                Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible et supprimera toutes les données associées (activités, souscriptions, etc.).
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2 justify-end mt-4">
                              <DialogClose asChild>
                                <Button variant="outline" data-testid="button-cancel-delete">
                                  Annuler
                                </Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (selectedEmail) {
                                    deleteMemberMutation.mutate(selectedEmail);
                                  }
                                }}
                                disabled={deleteMemberMutation.isPending}
                                data-testid="button-confirm-delete-member"
                              >
                                {deleteMemberMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Suppression...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer définitivement
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TabsContent>

                      <TabsContent value="activity" className="space-y-4">
                        {activitiesLoading ? (
                          <div className="space-y-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                        ) : activities.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucune activité enregistrée
                          </div>
                        ) : (
                          <ScrollArea className="h-[500px]">
                            <div className="space-y-3">
                              {activities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="p-4 rounded-lg border bg-card"
                                  data-testid={`activity-item-${activity.id}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                      {getActivityIcon(activity.activityType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <Badge className={getActivityBadgeColor(activity.activityType)} variant="secondary">
                                            {getActivityLabel(activity.activityType)}
                                          </Badge>
                                          <p className="font-medium mt-2 text-sm">
                                            {activity.entityTitle}
                                          </p>
                                        </div>
                                        <Badge
                                          variant={activity.scoreImpact >= 0 ? "default" : "destructive"}
                                          className="shrink-0"
                                        >
                                          {activity.scoreImpact > 0 ? "+" : ""}{activity.scoreImpact}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        {formatDate(activity.occurredAt)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </TabsContent>

                      <TabsContent value="subscriptions" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Historique des souscriptions</h3>
                          <Dialog open={showAddSubscriptionDialog} onOpenChange={setShowAddSubscriptionDialog}>
                            <DialogTrigger asChild>
                              <Button data-testid="button-add-subscription">
                                Ajouter une souscription
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ajouter une souscription</DialogTitle>
                                <DialogDescription>
                                  Enregistrez une nouvelle souscription pour {selectedMember.firstName} {selectedMember.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...subscriptionForm}>
                                <form onSubmit={handleAddSubscription} className="space-y-4">
                                  <FormField
                                    control={subscriptionForm.control}
                                    name="amountInEuros"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Montant (en euros)</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="number" 
                                            step="0.01" 
                                            placeholder="0.00"
                                            {...field}
                                            data-testid="input-subscription-amount"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={subscriptionForm.control}
                                    name="startDate"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Date de début</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="date" 
                                            {...field}
                                            data-testid="input-subscription-start"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={subscriptionForm.control}
                                    name="endDate"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Date de fin</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="date" 
                                            {...field}
                                            data-testid="input-subscription-end"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <Button
                                    type="submit"
                                    disabled={createSubscriptionMutation.isPending}
                                    data-testid="button-submit-subscription"
                                    className="w-full"
                                  >
                                    {createSubscriptionMutation.isPending ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Enregistrement...
                                      </>
                                    ) : (
                                      "Ajouter"
                                    )}
                                  </Button>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {subscriptionsLoading ? (
                          <div className="space-y-2">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                          </div>
                        ) : subscriptions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucune souscription enregistrée
                          </div>
                        ) : (
                          <ScrollArea className="h-[500px]">
                            <div className="space-y-3">
                              {subscriptions.map((subscription, index) => (
                                <Card key={subscription.id} data-testid={`card-subscription-${index}`}>
                                  <CardContent className="pt-6">
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <Euro className="h-5 w-5 text-success" />
                                        <div>
                                          <p className="text-sm text-muted-foreground">Montant</p>
                                          <p className="text-lg font-semibold text-success">
                                            {formatEuros(subscription.amountInCents)}
                                          </p>
                                        </div>
                                      </div>
                                      <Separator />
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-info" />
                                          <div>
                                            <p className="text-xs text-muted-foreground">Début</p>
                                            <p className="text-sm font-medium">
                                              {formatShortDate(subscription.startDate)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-warning" />
                                          <div>
                                            <p className="text-xs text-muted-foreground">Fin</p>
                                            <p className="text-sm font-medium">
                                              {formatShortDate(subscription.endDate)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Ajoutée {formatDate(subscription.createdAt)}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </TabsContent>

                      <TabsContent value="stats" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardDescription>Score total</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold text-cjd-green" data-testid="stat-total-score">
                                {selectedMember.engagementScore}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardDescription>Activités</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-3xl font-bold" data-testid="stat-total-activities">
                                {selectedMember.activityCount}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Détail des activités</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-info" />
                                <span className="text-sm">Idées proposées</span>
                              </div>
                              <Badge variant="secondary" data-testid="stat-ideas-proposed">
                                {activityStats.ideasProposed}
                              </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-info" />
                                <span className="text-sm">Votes effectués</span>
                              </div>
                              <Badge variant="secondary" data-testid="stat-votes-cast">
                                {activityStats.votesCast}
                              </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-success" />
                                <span className="text-sm">Événements inscrits</span>
                              </div>
                              <Badge variant="secondary" data-testid="stat-events-registered">
                                {activityStats.eventsRegistered}
                              </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-info" />
                                <span className="text-sm">Mécènes suggérés</span>
                              </div>
                              <Badge variant="secondary" data-testid="stat-patrons-suggested">
                                {activityStats.patronsSuggested}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Performance</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Score moyen par activité</span>
                                <span className="font-medium">
                                  {selectedMember.activityCount > 0
                                    ? (selectedMember.engagementScore / selectedMember.activityCount).toFixed(1)
                                    : "0"}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                <div
                                  className="bg-cjd-green h-2 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min((selectedMember.engagementScore / 100) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Objectif: 100 points
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="tags" className="space-y-4">
                        <MemberTags memberEmail={selectedEmail} />
                      </TabsContent>

                      <TabsContent value="tasks" className="space-y-4">
                        <MemberTasks memberEmail={selectedEmail} />
                      </TabsContent>

                      <TabsContent value="relations" className="space-y-4">
                        <MemberRelations memberEmail={selectedEmail} />
                      </TabsContent>

                      <TabsContent value="chatbot" className="space-y-4">
                        <MemberChatbot memberEmail={selectedEmail} />
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un membre pour voir ses détails</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
