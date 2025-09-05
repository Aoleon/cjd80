import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bug, Lightbulb, ExternalLink, Trash2, GitBranch } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { DevelopmentRequest, InsertDevelopmentRequest } from "@shared/schema";

const PRIORITY_COLORS = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

const STATUS_COLORS = {
  open: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  closed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800"
};

interface DevelopmentRequestsSectionProps {
  userRole: string;
}

export default function DevelopmentRequestsSection({ userRole }: DevelopmentRequestsSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Vérification des permissions - Super admin seulement
  if (userRole !== "super_admin") {
    return null;
  }

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<InsertDevelopmentRequest, "requestedBy" | "requestedByName">>({
    title: "",
    description: "",
    type: "bug",
    priority: "medium"
  });

  const { data: requests, isLoading } = useQuery<DevelopmentRequest[]>({
    queryKey: ["/api/admin/development-requests"],
  });

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
      setFormData({ title: "", description: "", type: "bug", priority: "medium" });
      setShowForm(false);
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

  const handleSubmit = (e: React.FormEvent) => {
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
  };

  const handleDelete = (requestId: string, title: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la demande "${title}" ?`)) {
      deleteRequestMutation.mutate(requestId);
    }
  };

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
                          <Bug className="w-4 h-4 text-red-500" />
                          Bug - Correction d'un problème
                        </div>
                      </SelectItem>
                      <SelectItem value="feature">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-500" />
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
                  disabled={createRequestMutation.isPending}
                  className="bg-cjd-green hover:bg-cjd-green/90"
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
          <CardTitle>Demandes existantes ({requests?.length || 0})</CardTitle>
          <CardDescription>
            Liste des demandes de développement et leur synchronisation avec GitHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>GitHub</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {request.type === "bug" ? (
                            <Bug className="w-4 h-4 text-red-500" />
                          ) : (
                            <Lightbulb className="w-4 h-4 text-blue-500" />
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
                        <Badge className={STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}>
                          {request.status === "in_progress" ? "En cours" : request.status}
                        </Badge>
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