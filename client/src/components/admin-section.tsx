import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Eye, 
  Trash2, 
  Calendar, 
  Users, 
  Lightbulb, 
  TrendingUp,
  LogOut,
  Loader2,
  Plus,
  Database,
  Edit,
  Download,
  CalendarPlus,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EventAdminModal from "./event-admin-modal";
import EventDetailModal from "./event-detail-modal";
import IdeaDetailModal from "./idea-detail-modal";
import InscriptionExportModal from "./inscription-export-modal";
import AdminLogin from "./admin-login";
import type { Idea, Event } from "@shared/schema";
import { IDEA_STATUS, EVENT_STATUS } from "@shared/schema";

interface IdeaWithVotes extends Omit<Idea, "voteCount"> {
  voteCount: number;
}

interface EventWithInscriptions extends Omit<Event, "inscriptionCount"> {
  inscriptionCount: number;
}

interface AdminStats {
  totalIdeas: number;
  totalVotes: number;
  upcomingEvents: number;
  totalInscriptions: number;
}

export default function AdminSection() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("ideas");
  
  // Modal states for event management
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState<"create" | "edit">("create");
  const [selectedEvent, setSelectedEvent] = useState<EventWithInscriptions | null>(null);
  
  // Modal states for details
  const [ideaDetailModalOpen, setIdeaDetailModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<IdeaWithVotes | null>(null);
  const [eventDetailModalOpen, setEventDetailModalOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventWithInscriptions | null>(null);
  
  // Modal state for inscription export
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [eventToExport, setEventToExport] = useState<EventWithInscriptions | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user,
  });

  const { data: ideas, isLoading: ideasLoading } = useQuery<IdeaWithVotes[]>({
    queryKey: ["/api/admin/ideas"],
    enabled: !!user && activeTab === "ideas",
  });

  const { data: events, isLoading: eventsLoading } = useQuery<EventWithInscriptions[]>({
    queryKey: ["/api/admin/events"],
    enabled: !!user && activeTab === "events",
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ideas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Idée supprimée",
        description: "L'idée a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'idée",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      });
    },
  });

  // Event management functions
  const handleCreateEvent = () => {
    setEventModalMode("create");
    setSelectedEvent(null);
    setEventModalOpen(true);
  };

  const handleEditEvent = (event: EventWithInscriptions) => {
    setEventModalMode("edit");
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const handleExportInscriptions = (event: EventWithInscriptions) => {
    setEventToExport(event);
    setExportModalOpen(true);
  };

  const handleDeleteIdea = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette idée ?")) {
      deleteIdeaMutation.mutate(id);
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      deleteEventMutation.mutate(id);
    }
  };

  // Status update mutations
  const updateIdeaStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/ideas/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] }); 
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'idée a été mis à jour",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'idée",
        variant: "destructive",
      });
    },
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/events/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'événement a été mis à jour",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'événement",
        variant: "destructive",
      });
    },
  });

  const toggleIdeaFeaturedMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/ideas/${id}/featured`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "Mise en avant modifiée",
        description: "Le statut de mise en avant de l'idée a été modifié",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la mise en avant de l'idée",
        variant: "destructive",
      });
    },
  });

  const transformToEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/admin/ideas/${id}/transform-to-event`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Idée transformée",
        description: "L'idée a été transformée en événement avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de transformation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleIdeaStatusChange = (id: string, status: string) => {
    updateIdeaStatusMutation.mutate({ id, status });
  };

  const handleEventStatusChange = (id: string, status: string) => {
    updateEventStatusMutation.mutate({ id, status });
  };

  const handleTransformIdeaToEvent = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir transformer cette idée en événement ? Cette action créera un nouvel événement basé sur cette idée.")) {
      transformToEventMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getIdeaStatusInfo = (status: string) => {
    switch (status) {
      case IDEA_STATUS.PENDING:
        return { label: "En attente", class: "bg-orange-100 text-orange-800" };
      case IDEA_STATUS.APPROVED:
        return { label: "Idée soumise au vote", class: "bg-green-100 text-green-800" };
      case IDEA_STATUS.REJECTED:
        return { label: "Rejetée", class: "bg-red-100 text-red-800" };
      case IDEA_STATUS.UNDER_REVIEW:
        return { label: "En cours d'étude", class: "bg-blue-100 text-blue-800" };
      case IDEA_STATUS.POSTPONED:
        return { label: "Reportée", class: "bg-gray-100 text-gray-800" };
      case IDEA_STATUS.COMPLETED:
        return { label: "Réalisée", class: "bg-purple-100 text-purple-800" };
      default:
        return { label: "Inconnu", class: "bg-gray-100 text-gray-800" };
    }
  };

  const getEventStatusInfo = (status: string) => {
    switch (status) {
      case EVENT_STATUS.DRAFT:
        return { label: "Brouillon", class: "bg-gray-100 text-gray-800" };
      case EVENT_STATUS.PUBLISHED:
        return { label: "Publié", class: "bg-green-100 text-green-800" };
      case EVENT_STATUS.CANCELLED:
        return { label: "Annulé", class: "bg-red-100 text-red-800" };
      case EVENT_STATUS.POSTPONED:
        return { label: "Reporté", class: "bg-orange-100 text-orange-800" };
      case EVENT_STATUS.COMPLETED:
        return { label: "Terminé", class: "bg-blue-100 text-blue-800" };
      default:
        return { label: "Inconnu", class: "bg-gray-100 text-gray-800" };
    }
  };

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Administration</h2>
          <p className="text-sm sm:text-base text-gray-600">Bienvenue, {user.email}</p>
        </div>
        <Button
          onClick={() => logoutMutation.mutate()}
          variant="outline"
          className="text-gray-600 hover:text-gray-800 w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
      </div>

      {/* Dashboard Stats */}
      {statsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-cjd-green mb-2">
                {stats.totalIdeas}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center">
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Idées proposées</span>
                <span className="sm:hidden">Idées</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-cjd-green mb-2">
                {stats.totalVotes}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Votes totaux</span>
                <span className="sm:hidden">Votes</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-cjd-green mb-2">
                {stats.upcomingEvents}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Événements à venir</span>
                <span className="sm:hidden">Événements</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-cjd-green mb-2">
                {stats.totalInscriptions}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 flex items-center justify-center">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Inscriptions totales</span>
                <span className="sm:hidden">Inscriptions</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Admin Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="ideas" className="text-xs sm:text-sm">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Gestion des idées</span>
              <span className="sm:hidden">Idées</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Gestion des événements</span>
              <span className="sm:hidden">Événements</span>
            </TabsTrigger>
          </TabsList>

          {/* Ideas Management Tab */}
          <TabsContent value="ideas" className="p-3 sm:p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-semibold">Toutes les idées</h3>
              </div>

              {ideasLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
                </div>
              ) : ideas && ideas.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Auteur</TableHead>
                          <TableHead className="text-center">Statut</TableHead>
                          <TableHead className="text-center">Votants</TableHead>
                          <TableHead className="text-center">Date</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ideas.map((idea) => (
                          <TableRow key={idea.id}>
                            <TableCell className="font-medium max-w-xs">
                              <div>
                                <button
                                  onClick={() => {
                                    setSelectedIdea(idea);
                                    setIdeaDetailModalOpen(true);
                                  }}
                                  className="font-semibold text-left hover:text-cjd-green transition-colors cursor-pointer text-blue-600 hover:underline"
                                >
                                  <div className="flex items-center gap-1">
                                    {idea.featured && (
                                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                                    )}
                                    {idea.title}
                                  </div>
                                </button>
                                {idea.description && (
                                  <div className="text-sm text-gray-500 truncate">
                                    {idea.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{idea.proposedBy}</TableCell>
                            <TableCell className="text-center">
                              <Select 
                                value={idea.status} 
                                onValueChange={(status) => handleIdeaStatusChange(idea.id, status)}
                                disabled={updateIdeaStatusMutation.isPending}
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue>
                                    <div className={`inline-block px-2 py-1 text-xs rounded-full ${getIdeaStatusInfo(idea.status).class}`}>
                                      {getIdeaStatusInfo(idea.status).label}
                                    </div>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={IDEA_STATUS.PENDING}>En attente</SelectItem>
                                  <SelectItem value={IDEA_STATUS.APPROVED}>Idée soumise au vote</SelectItem>
                                  <SelectItem value={IDEA_STATUS.REJECTED}>Rejetée</SelectItem>
                                  <SelectItem value={IDEA_STATUS.UNDER_REVIEW}>En cours d'étude</SelectItem>
                                  <SelectItem value={IDEA_STATUS.POSTPONED}>Reportée</SelectItem>
                                  <SelectItem value={IDEA_STATUS.COMPLETED}>Réalisée</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedIdea(idea);
                                  setIdeaDetailModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                title="Voir les votants"
                              >
                                <Users className="w-4 h-4 mr-1" />
                                {idea.voteCount}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              {formatDate(idea.createdAt.toString())}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleIdeaFeaturedMutation.mutate(idea.id)}
                                  disabled={toggleIdeaFeaturedMutation.isPending}
                                  className={idea.featured ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50" : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"}
                                  title={idea.featured ? "Retirer la mise en avant" : "Mettre en avant cette idée"}
                                >
                                  <Star className={`w-4 h-4 ${idea.featured ? "fill-current" : ""}`} />
                                </Button>
                                {(idea.status === IDEA_STATUS.APPROVED || idea.status === IDEA_STATUS.COMPLETED) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleTransformIdeaToEvent(idea.id)}
                                    disabled={transformToEventMutation.isPending}
                                    className="text-cjd-green hover:text-green-700 hover:bg-green-50"
                                    title="Transformer cette idée en événement"
                                    data-testid={`button-transform-${idea.id}`}
                                  >
                                    <CalendarPlus className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteIdea(idea.id)}
                                  disabled={deleteIdeaMutation.isPending}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  title="Supprimer cette idée"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {ideas.map((idea) => (
                      <Card key={idea.id} className="p-4">
                        <div className="space-y-3">
                          {/* Header with title and status */}
                          <div className="flex justify-between items-start gap-3">
                            <button
                              onClick={() => {
                                setSelectedIdea(idea);
                                setIdeaDetailModalOpen(true);
                              }}
                              className="flex-1 text-left"
                            >
                              <h4 className="font-semibold text-blue-600 hover:text-cjd-green transition-colors hover:underline flex items-center gap-1">
                                {idea.featured && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                                )}
                                {idea.title}
                              </h4>
                              {idea.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {idea.description}
                                </p>
                              )}
                            </button>
                            <div className={`px-2 py-1 text-xs rounded-full ${getIdeaStatusInfo(idea.status).class} whitespace-nowrap`}>
                              {getIdeaStatusInfo(idea.status).label}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Auteur:</span>
                              <div className="truncate">{idea.proposedBy}</div>
                            </div>
                            <div>
                              <span className="font-medium">Votants:</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedIdea(idea);
                                  setIdeaDetailModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                                title="Voir les votants"
                              >
                                <Users className="w-3 h-3 mr-1" />
                                {idea.voteCount}
                              </Button>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Date:</span>
                              <div>{formatDate(idea.createdAt.toString())}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="pt-3 border-t border-gray-200 space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Changer le statut
                              </label>
                              <Select 
                                value={idea.status} 
                                onValueChange={(status) => handleIdeaStatusChange(idea.id, status)}
                                disabled={updateIdeaStatusMutation.isPending}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue>
                                    <div className={`inline-block px-2 py-1 text-xs rounded-full ${getIdeaStatusInfo(idea.status).class}`}>
                                      {getIdeaStatusInfo(idea.status).label}
                                    </div>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={IDEA_STATUS.PENDING}>En attente</SelectItem>
                                  <SelectItem value={IDEA_STATUS.APPROVED}>Idée soumise au vote</SelectItem>
                                  <SelectItem value={IDEA_STATUS.REJECTED}>Rejetée</SelectItem>
                                  <SelectItem value={IDEA_STATUS.UNDER_REVIEW}>En cours d'étude</SelectItem>
                                  <SelectItem value={IDEA_STATUS.POSTPONED}>Reportée</SelectItem>
                                  <SelectItem value={IDEA_STATUS.COMPLETED}>Réalisée</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleIdeaFeaturedMutation.mutate(idea.id)}
                                disabled={toggleIdeaFeaturedMutation.isPending}
                                className={`flex-1 ${idea.featured ? "text-yellow-500 border-yellow-300 hover:bg-yellow-50" : "text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                              >
                                <Star className={`w-4 h-4 mr-2 ${idea.featured ? "fill-current" : ""}`} />
                                {idea.featured ? "Retirer mise en avant" : "Mettre en avant"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteIdea(idea.id)}
                                disabled={deleteIdeaMutation.isPending}
                                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune idée</h3>
                  <p className="text-gray-500">Les idées apparaîtront ici une fois proposées</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Events Management Tab */}
          <TabsContent value="events" className="p-3 sm:p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-semibold">Tous les événements</h3>
                <Button
                  onClick={handleCreateEvent}
                  className="bg-cjd-green hover:bg-green-700 text-white w-full sm:w-auto"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Nouvel événement
                </Button>
              </div>

              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
                </div>
              ) : events && events.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Lieu</TableHead>
                          <TableHead>HelloAsso</TableHead>
                          <TableHead className="text-center">Inscrits</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium max-w-xs">
                              <div>
                                <button
                                  onClick={() => {
                                    setSelectedEventForDetail(event);
                                    setEventDetailModalOpen(true);
                                  }}
                                  className="font-semibold text-left hover:text-cjd-green transition-colors cursor-pointer text-blue-600 hover:underline"
                                >
                                  {event.title}
                                </button>
                                {event.description && (
                                  <div className="text-sm text-gray-500 truncate">
                                    {event.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(event.date).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {event.location || <span className="text-gray-400">Non défini</span>}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {event.helloAssoLink ? (
                                <a href={event.helloAssoLink} target="_blank" rel="noopener noreferrer" className="text-cjd-green hover:underline">
                                  Lien actif
                                </a>
                              ) : (
                                <span className="text-gray-400">Aucun lien</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedEventForDetail(event);
                                  setEventDetailModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                title="Voir les inscrits"
                              >
                                <Users className="w-4 h-4 mr-1" />
                                {event.inscriptionCount}
                                {event.maxParticipants && ` / ${event.maxParticipants}`}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditEvent(event)}
                                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                  title="Modifier l'événement"
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                {event.inscriptionCount > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleExportInscriptions(event)}
                                    className="text-green-600 border-green-300 hover:bg-green-50"
                                    title="Exporter les inscriptions"
                                  >
                                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  disabled={deleteEventMutation.isPending}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                  title="Supprimer l'événement"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {events.map((event) => (
                      <Card key={event.id} className="p-4">
                        <div className="space-y-3">
                          {/* Header with title */}
                          <button
                            onClick={() => {
                              setSelectedEventForDetail(event);
                              setEventDetailModalOpen(true);
                            }}
                            className="w-full text-left"
                          >
                            <h4 className="font-semibold text-blue-600 hover:text-cjd-green transition-colors hover:underline">
                              {event.title}
                            </h4>
                            {event.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </button>

                          {/* Metadata Grid */}
                          <div className="grid grid-cols-1 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Date:</span>
                              <div className="text-gray-600">
                                {new Date(event.date).toLocaleDateString("fr-FR", {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700">Lieu:</span>
                              <div className="text-gray-600">
                                {event.location || <span className="text-gray-400">Non défini</span>}
                              </div>
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">HelloAsso:</span>
                              <div className="text-gray-600">
                                {event.helloAssoLink ? (
                                  <a href={event.helloAssoLink} target="_blank" rel="noopener noreferrer" className="text-cjd-green hover:underline">
                                    Lien actif →
                                  </a>
                                ) : (
                                  <span className="text-gray-400">Aucun lien</span>
                                )}
                              </div>
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">Inscriptions:</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedEventForDetail(event);
                                  setEventDetailModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                                title="Voir les inscrits"
                              >
                                <Users className="w-3 h-3 mr-1" />
                                {event.inscriptionCount}
                                {event.maxParticipants && ` / ${event.maxParticipants}`}
                              </Button>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-1 gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditEvent(event)}
                                className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier l'événement
                              </Button>
                              
                              {event.inscriptionCount > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExportInscriptions(event)}
                                  className="w-full text-green-600 border-green-300 hover:bg-green-50"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Exporter les inscriptions ({event.inscriptionCount})
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteEvent(event.id)}
                                disabled={deleteEventMutation.isPending}
                                className="w-full text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer l'événement
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun événement</h3>
                  <p className="text-gray-500">Les événements apparaîtront ici une fois créés</p>
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </Card>

      {/* Modals */}
      <EventAdminModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        event={selectedEvent}
        mode={eventModalMode}
      />

      <EventDetailModal
        open={eventDetailModalOpen}
        onOpenChange={setEventDetailModalOpen}
        event={selectedEventForDetail}
        onEdit={(event) => {
          setSelectedEvent(event);
          setEventModalMode("edit");
          setEventModalOpen(true);
        }}
      />

      <IdeaDetailModal
        open={ideaDetailModalOpen}
        onOpenChange={setIdeaDetailModalOpen}
        idea={selectedIdea}
      />
      
      <InscriptionExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        event={eventToExport}
      />
    </section>
  );
}
