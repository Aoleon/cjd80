import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Bug, Lightbulb, ExternalLink, Trash2, GitBranch, RefreshCw, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { DevelopmentRequest, InsertDevelopmentRequest } from "@shared/schema";

// Constantes mémorisées pour éviter les re-créations
const PRIORITY_COLORS = {
  low: "bg-info-light text-info-dark",
  medium: "bg-warning-light text-warning-dark", 
  high: "bg-orange-100 text-orange-800",
  critical: "bg-error-light text-error-dark"
} as const;

const STATUS_COLORS = {
  open: "bg-success-light text-success-dark",
  in_progress: "bg-info-light text-info-dark",
  closed: "bg-gray-100 text-gray-800",
  cancelled: "bg-error-light text-error-dark"
} as const;

const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  type: "bug" as const,
  priority: "medium" as const
};

// Types optimisés
type PriorityKey = keyof typeof PRIORITY_COLORS;
type StatusKey = keyof typeof STATUS_COLORS;

interface DevelopmentRequestsSectionProps {
  userRole: string;
}

export default function DevelopmentRequestsSection({ userRole }: DevelopmentRequestsSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Early return optimisé avec React.memo 
  if (userRole !== "super_admin") {
    return null;
  }

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<InsertDevelopmentRequest, "requestedBy" | "requestedByName">>(INITIAL_FORM_DATA);
  
  // États pour l'édition de statut
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<{
    status: string;
    adminComment: string;
  }>({
    status: "",
    adminComment: ""
  });
  
  // Vérifier si l'utilisateur peut modifier les statuts
  const canEditStatus = user?.email === "thibault@youcom.io";

  const { data: requests, isLoading } = useQuery<DevelopmentRequest[]>({
    queryKey: ["/api/admin/development-requests"],
    staleTime: 30 * 1000, // Cache pendant 30 secondes pour les données admin
  });

  // Données mémorisées et triées
  const sortedRequests = useMemo(() => {
    if (!requests) return [];
    return [...requests].sort((a, b) => {
      // Trier par priorité puis par date
      const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
      const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 5) - 
                          (priorityOrder[b.priority as keyof typeof priorityOrder] || 5);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [requests]);

  // Validation du formulaire mémorisée 
  const isFormValid = useMemo(() => {
    return formData.title.trim().length >= 3 && formData.description.trim().length >= 10;
  }, [formData.title, formData.description]);

  const createRequestMutation = useMutation({
    mutationFn: async (requestData: Omit<InsertDevelopmentRequest, "requestedBy" | "requestedByName">) => {
      const response = await apiRequest("POST", "/api/admin/development-requests", requestData);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erreur lors de la création de la demande");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/development-requests"] });
      resetForm();
      toast({
        title: "Demande créée",
        description: "Votre demande de développement a été créée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await apiRequest("DELETE", `/api/admin/development-requests/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/development-requests"] });
      toast({
        title: "Demande supprimée",
        description: "La demande de développement a été supprimée avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la demande",
        variant: "destructive",
      });
    },
  });

  const syncRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("POST", `/api/admin/development-requests/${requestId}/sync`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erreur lors de la synchronisation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/development-requests"] });
      toast({
        title: "Synchronisation réussie",
        description: "Les données ont été synchronisées avec GitHub.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status, adminComment }: { requestId: string; status: string; adminComment?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/development-requests/${requestId}/status`, {
        status,
        adminComment
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erreur lors de la mise à jour du statut");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/development-requests"] });
      setEditingStatus(null);
      setStatusData({ status: "", adminComment: "" });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la demande a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de mise à jour",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handlers mémorisés pour éviter les re-renders inutiles
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate(formData);
  }, [formData, createRequestMutation, toast]);

  const handleDelete = useCallback((requestId: string, title: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la demande "${title}" ?`)) {
      deleteRequestMutation.mutate(requestId);
    }
  }, [deleteRequestMutation]);

  const handleSync = useCallback((requestId: string, title: string) => {
    if (confirm(`Synchroniser la demande "${title}" avec GitHub ?`)) {
      syncRequestMutation.mutate(requestId);
    }
  }, [syncRequestMutation]);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setShowForm(false);
  }, []);

  const handleEditStatus = useCallback((request: DevelopmentRequest) => {
    setEditingStatus(request.id);
    setStatusData({
      status: request.status,
      adminComment: request.adminComment || ""
    });
  }, []);

  const handleUpdateStatus = useCallback((requestId: string) => {
    if (!statusData.status) {
      toast({
        title: "Statut requis",
        description: "Veuillez sélectionner un statut",
        variant: "destructive",
      });
      return;
    }
    
    updateStatusMutation.mutate({
      requestId,
      status: statusData.status,
      adminComment: statusData.adminComment || undefined
    });
  }, [statusData, updateStatusMutation, toast]);

  const handleCancelEdit = useCallback(() => {
    setEditingStatus(null);
    setStatusData({ status: "", adminComment: "" });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-cjd-green" />
            Demandes de Développement
          </h2>
          <p className="text-gray-600 mt-1">
            Gérer les demandes de bugs et fonctionnalités avec GitHub Issues
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-cjd-green hover:bg-cjd-green/90 text-white"
          data-testid="button-toggle-dev-request-form"
        >
          {showForm ? "Annuler" : "Nouvelle Demande"}
        </Button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle Demande de Développement</CardTitle>
            <CardDescription>
              Créer une nouvelle demande de bug ou de fonctionnalité qui sera automatiquement ajoutée comme issue GitHub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="request-type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value: "bug" | "feature") => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger data-testid="select-request-type">
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">
                        <div className="flex items-center gap-2">
                          <Bug className="w-4 h-4 text-error" />
                          Bug - Correction d'un problème
                        </div>
                      </SelectItem>
                      <SelectItem value="feature">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-info" />
                          Fonctionnalité - Nouvelle feature
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="request-priority">Priorité *</Label>
                  <Select value={formData.priority} onValueChange={(value: "low" | "medium" | "high" | "critical") => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger data-testid="select-request-priority">
                      <SelectValue placeholder="Sélectionner la priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="request-title">Titre *</Label>
                <Input
                  id="request-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre concis et descriptif..."
                  required
                  data-testid="input-request-title"
                />
              </div>

              <div>
                <Label htmlFor="request-description">Description *</Label>
                <Textarea
                  id="request-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description détaillée du problème ou de la fonctionnalité demandée..."
                  rows={5}
                  required
                  data-testid="textarea-request-description"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={createRequestMutation.isPending || !isFormValid}
                  className="bg-cjd-green hover:bg-cjd-green/90 disabled:opacity-50"
                  data-testid="button-submit-request"
                >
                  {createRequestMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer la demande"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tableau des demandes */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes existantes ({sortedRequests?.length || 0})</CardTitle>
          <CardDescription>
            Liste des demandes de développement et leur synchronisation avec GitHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
            </div>
          ) : sortedRequests && sortedRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Commentaire Admin</TableHead>
                    <TableHead>GitHub</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {request.type === "bug" ? (
                            <Bug className="w-4 h-4 text-error" />
                          ) : (
                            <Lightbulb className="w-4 h-4 text-info" />
                          )}
                          <span className="capitalize">{request.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate" title={request.title}>
                            {request.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate" title={request.description}>
                            {request.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={PRIORITY_COLORS[request.priority as keyof typeof PRIORITY_COLORS]}>
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingStatus === request.id ? (
                          <div className="space-y-2">
                            <Select 
                              value={statusData.status} 
                              onValueChange={(value) => setStatusData(prev => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">En cours</SelectItem>
                                <SelectItem value="closed">Fermé</SelectItem>
                                <SelectItem value="cancelled">Annulé</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <Badge className={STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}>
                            {request.status === "in_progress" ? "En cours" : request.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingStatus === request.id ? (
                          <Textarea
                            value={statusData.adminComment}
                            onChange={(e) => setStatusData(prev => ({ ...prev, adminComment: e.target.value }))}
                            placeholder="Commentaire administrateur..."
                            className="min-h-[60px] w-64"
                          />
                        ) : (
                          <div className="max-w-xs">
                            {request.adminComment ? (
                              <div className="text-sm">
                                <p className="truncate" title={request.adminComment}>
                                  {request.adminComment}
                                </p>
                                {request.lastStatusChangeBy && (
                                  <p className="text-gray-500 text-xs mt-1">
                                    Par: {request.lastStatusChangeBy}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Aucun commentaire</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.githubIssueUrl ? (
                          <a
                            href={request.githubIssueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            #{request.githubIssueNumber}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400">Non créé</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          {editingStatus === request.id ? (
                            // Boutons de sauvegarde/annulation
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(request.id)}
                                disabled={updateStatusMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                data-testid={`button-save-status-${request.id}`}
                              >
                                {updateStatusMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Sauvegarder"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={updateStatusMutation.isPending}
                                data-testid={`button-cancel-edit-${request.id}`}
                              >
                                Annuler
                              </Button>
                            </>
                          ) : (
                            // Boutons normaux
                            <>
                              {canEditStatus && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditStatus(request)}
                                  className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                  data-testid={`button-edit-status-${request.id}`}
                                  title="Modifier le statut (réservé au super admin)"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {request.githubIssueNumber && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSync(request.id, request.title)}
                                  disabled={syncRequestMutation.isPending}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  data-testid={`button-sync-request-${request.id}`}
                                  title="Synchroniser avec GitHub"
                                >
                                  <RefreshCw className={`w-4 h-4 ${syncRequestMutation.isPending ? 'animate-spin' : ''}`} />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(request.id, request.title)}
                                disabled={deleteRequestMutation.isPending}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                data-testid={`button-delete-request-${request.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune demande</h3>
              <p className="text-gray-500">Les demandes de développement apparaîtront ici une fois créées</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}