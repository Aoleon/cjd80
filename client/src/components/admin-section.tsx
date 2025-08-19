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
import type { Idea, Event } from "@shared/schema";

interface IdeaWithVotes extends Omit<Idea, "voteCount"> {
  voteCount: number;
}

interface EventWithRegistrations extends Omit<Event, "registrationCount"> {
  registrationCount: number;
}

interface AdminStats {
  totalIdeas: number;
  totalVotes: number;
  upcomingEvents: number;
  totalRegistrations: number;
}

export default function AdminSection() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("ideas");

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user,
  });

  const { data: ideas, isLoading: ideasLoading } = useQuery<IdeaWithVotes[]>({
    queryKey: ["/api/ideas"],
    enabled: !!user && activeTab === "ideas",
  });

  const { data: events, isLoading: eventsLoading } = useQuery<EventWithRegistrations[]>({
    queryKey: ["/api/events"],
    enabled: !!user && activeTab === "events",
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ideas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Veuillez vous connecter pour accéder à l'administration</p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Admin Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Administration</h2>
          <p className="text-gray-600">Bienvenue, {user.username}</p>
        </div>
        <Button
          onClick={() => logoutMutation.mutate()}
          variant="outline"
          className="text-gray-600 hover:text-gray-800"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-cjd-green mb-2">
                {stats.totalIdeas}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 mr-1" />
                Idées proposées
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-cjd-green mb-2">
                {stats.totalVotes}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Votes totaux
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-cjd-green mb-2">
                {stats.upcomingEvents}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 mr-1" />
                Événements à venir
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-cjd-green mb-2">
                {stats.totalRegistrations}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center">
                <Users className="w-4 h-4 mr-1" />
                Inscriptions totales
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Admin Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="ideas" className="flex-1">Gestion des idées</TabsTrigger>
            <TabsTrigger value="events" className="flex-1">Gestion des événements</TabsTrigger>
          </TabsList>

          {/* Ideas Management Tab */}
          <TabsContent value="ideas" className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Toutes les idées</h3>
              </div>

              {ideasLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
                </div>
              ) : ideas && ideas.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Auteur</TableHead>
                        <TableHead className="text-center">Votes</TableHead>
                        <TableHead className="text-center">Date</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ideas.map((idea) => (
                        <TableRow key={idea.id}>
                          <TableCell className="font-medium max-w-xs">
                            <div>
                              <div className="font-semibold">{idea.title}</div>
                              {idea.description && (
                                <div className="text-sm text-gray-500 truncate">
                                  {idea.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{idea.authorName}</TableCell>
                          <TableCell className="text-center">{idea.voteCount}</TableCell>
                          <TableCell className="text-center">
                            {formatDate(idea.createdAt)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteIdea(idea.id)}
                                disabled={deleteIdeaMutation.isPending}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
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
          <TabsContent value="events" className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tous les événements</h3>
              </div>

              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
                </div>
              ) : events && events.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Lieu</TableHead>
                        <TableHead className="text-center">Inscrits</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium max-w-xs">
                            <div>
                              <div className="font-semibold">{event.title}</div>
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
                          <TableCell className="max-w-xs truncate">{event.location}</TableCell>
                          <TableCell className="text-center">
                            {event.registrationCount}
                            {event.maxAttendees && ` / ${event.maxAttendees}`}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteEvent(event.id)}
                                disabled={deleteEventMutation.isPending}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
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
    </section>
  );
}
