'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, queryKeys, type PaginatedResponse } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Eye, Trash2, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type IdeaStatus = 'pending' | 'approved' | 'rejected' | 'under_review' | 'postponed' | 'completed';

interface Idea {
  id: string;
  title: string;
  description?: string;
  proposedBy: string;
  proposedByEmail: string;
  status: IdeaStatus;
  voteCount?: number;
  createdAt: string;
}

/**
 * Page Gestion Idées Admin
 * CRUD complet sur les idées avec gestion des statuts
 */
export default function AdminIdeasPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | 'all'>('all');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Query pour lister les idées
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.ideas.list({ page, limit: 20 }),
    queryFn: () => api.get<PaginatedResponse<Idea>>('/api/ideas', { page, limit: 20 }),
  });

  // Mutation pour mettre à jour le statut
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: IdeaStatus }) =>
      api.patch(`/api/ideas/${id}/status`, { status }),
    onSuccess: () => {
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de l\'idée a été modifié avec succès',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      setShowDetailsModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour supprimer une idée
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/ideas/${id}`),
    onSuccess: () => {
      toast({
        title: 'Idée supprimée',
        description: 'L\'idée a été supprimée avec succès',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
      setShowDetailsModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleUpdateStatus = (id: string, status: IdeaStatus) => {
    if (confirm(`Êtes-vous sûr de vouloir modifier le statut de cette idée ?`)) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette idée ? Cette action est irréversible.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewDetails = (idea: Idea) => {
    setSelectedIdea(idea);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-light text-success-dark border-success/20';
      case 'rejected':
        return 'bg-error-light text-error-dark border-error/20';
      case 'pending':
        return 'bg-warning-light text-warning-dark border-warning/20';
      case 'under_review':
        return 'bg-info-light text-info-dark border-info/20';
      case 'postponed':
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      case 'completed':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Rejetée';
      case 'pending':
        return 'En attente';
      case 'under_review':
        return 'En examen';
      case 'postponed':
        return 'Reportée';
      case 'completed':
        return 'Complétée';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
            <CardDescription>Impossible de charger les idées</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data with proper type narrowing
  const ideas = (data && 'data' in data ? data.data : []) as Idea[];
  const total = (data && 'total' in data ? data.total : 0) as number;
  const limit = (data && 'limit' in data ? data.limit : 20) as number;

  // Filtrer les idées par statut
  const filteredIdeas = statusFilter === 'all'
    ? ideas
    : ideas.filter((idea: Idea) => idea.status === statusFilter);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Idées</h1>
          <p className="text-muted-foreground">
            Modérez et gérez les idées proposées par les membres
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ideas.filter((i: Idea) => i.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success-dark">
              {ideas.filter((i: Idea) => i.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error-dark">
              {ideas.filter((i: Idea) => i.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Liste des idées</CardTitle>
              <CardDescription>
                {filteredIdeas.length} idée(s) affichée(s)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value: IdeaStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvées</SelectItem>
                  <SelectItem value="rejected">Rejetées</SelectItem>
                  <SelectItem value="under_review">En examen</SelectItem>
                  <SelectItem value="postponed">Reportées</SelectItem>
                  <SelectItem value="completed">Complétées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIdeas && filteredIdeas.length > 0 ? (
                filteredIdeas.map((idea: Idea) => (
                  <TableRow key={idea.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {idea.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{idea.proposedBy}</span>
                        <span className="text-xs text-muted-foreground">{idea.proposedByEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(idea.status)}>
                        {getStatusLabel(idea.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{idea.voteCount || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(idea.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(idea)}
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {idea.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateStatus(idea.id, 'approved')}
                              disabled={updateStatusMutation.isPending}
                              title="Approuver"
                            >
                              <Check className="h-4 w-4 text-success-dark" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateStatus(idea.id, 'rejected')}
                              disabled={updateStatusMutation.isPending}
                              title="Rejeter"
                            >
                              <X className="h-4 w-4 text-error-dark" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(idea.id)}
                          disabled={deleteMutation.isPending}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Aucune idée trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {Math.ceil(total / limit) > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <div className="flex items-center px-4 text-sm">
                Page {page} sur {Math.ceil(total / limit)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(Math.ceil(total / limit), p + 1))}
                disabled={page === Math.ceil(total / limit)}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedIdea?.title}</DialogTitle>
            <DialogDescription>
              Proposée par {selectedIdea?.proposedBy} le{' '}
              {selectedIdea && new Date(selectedIdea.createdAt).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>
          {selectedIdea && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedIdea.description || 'Aucune description fournie'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Statut actuel</h4>
                <Badge className={getStatusColor(selectedIdea.status)}>
                  {getStatusLabel(selectedIdea.status)}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Votes</h4>
                <p className="text-sm">{selectedIdea.voteCount || 0} vote(s)</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Changer le statut</h4>
                <Select
                  value={selectedIdea.status}
                  onValueChange={(value: IdeaStatus) =>
                    handleUpdateStatus(selectedIdea.id, value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvée</SelectItem>
                    <SelectItem value="rejected">Rejetée</SelectItem>
                    <SelectItem value="under_review">En examen</SelectItem>
                    <SelectItem value="postponed">Reportée</SelectItem>
                    <SelectItem value="completed">Complétée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedIdea.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer l'idée
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
