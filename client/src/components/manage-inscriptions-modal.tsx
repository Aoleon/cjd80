import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Users, Mail, User, MessageSquare, Plus, Loader2, Upload, FileText, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import type { Event } from "@shared/schema";

interface EventWithInscriptions extends Omit<Event, "inscriptionCount"> {
  inscriptionCount: number;
}

interface Inscription {
  id: string;
  eventId: string;
  name: string;
  email: string;
  comments?: string;
  createdAt: Date;
}

interface ManageInscriptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventWithInscriptions | null;
}

export default function ManageInscriptionsModal({ 
  open, 
  onOpenChange, 
  event 
}: ManageInscriptionsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInscription, setNewInscription] = useState({
    name: "",
    email: "",
    comments: ""
  });
  
  // Import bulk states
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [parsedInscriptions, setParsedInscriptions] = useState<Array<{name: string, email: string, comments?: string}>>([]);

  const { data: inscriptions, isLoading } = useQuery<Inscription[]>({
    queryKey: ["/api/admin/inscriptions", event?.id],
    enabled: !!event?.id && open,
  });

  const deleteInscriptionMutation = useMutation({
    mutationFn: async (inscriptionId: string) => {
      await apiRequest("DELETE", `/api/admin/inscriptions/${inscriptionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inscriptions", event?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Inscription supprimée",
        description: "L'inscription a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'inscription",
        variant: "destructive",
      });
    },
  });

  const addInscriptionMutation = useMutation({
    mutationFn: async (inscription: { eventId: string; name: string; email: string; comments?: string }) => {
      const res = await apiRequest("POST", "/api/admin/inscriptions", inscription);
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Erreur lors de l'ajout de l'inscription");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inscriptions", event?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setNewInscription({ name: "", email: "", comments: "" });
      setShowAddForm(false);
      toast({
        title: "Inscription ajoutée",
        description: "L'inscription a été ajoutée avec succès",
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

  const bulkImportMutation = useMutation({
    mutationFn: async (data: { eventId: string; inscriptions: Array<{name: string, email: string, comments?: string}> }) => {
      const res = await apiRequest("POST", "/api/admin/inscriptions/bulk", data);
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Erreur lors de l'import en masse");
      }
      return await res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inscriptions", event?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setBulkText("");
      setParsedInscriptions([]);
      setShowBulkImport(false);
      
      const { created, errors, errorMessages } = result;
      toast({
        title: "Import terminé",
        description: `${created} inscription(s) ajoutée(s)${errors > 0 ? `, ${errors} erreur(s)` : ''}`,
        variant: errors > 0 ? "destructive" : "default",
      });
      
      if (errorMessages && errorMessages.length > 0) {
        console.warn("Erreurs d'import:", errorMessages);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur d'import",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!open) {
      setShowAddForm(false);
      setNewInscription({ name: "", email: "", comments: "" });
      setShowBulkImport(false);
      setBulkText("");
      setParsedInscriptions([]);
    }
  }, [open]);

  const handleDeleteInscription = (inscriptionId: string, participantName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'inscription de ${participantName} ?`)) {
      deleteInscriptionMutation.mutate(inscriptionId);
    }
  };

  const handleAddInscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !newInscription.name.trim() || !newInscription.email.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le nom et l'email",
        variant: "destructive",
      });
      return;
    }

    addInscriptionMutation.mutate({
      eventId: event.id,
      name: newInscription.name.trim(),
      email: newInscription.email.trim(),
      comments: newInscription.comments.trim() || undefined,
    });
  };

  const parseInscriptionsText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: Array<{name: string, email: string, comments?: string}> = [];
    const errors: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Support several formats:
      // "Name,email" or "Name,email,comments" or "Name;email" or "Name email@domain.com"
      const parts = line.split(/[,;]/);
      
      if (parts.length >= 2) {
        // CSV format: "Name,email" or "Name,email,comments"
        const name = parts[0].trim();
        const email = parts[1].trim();
        const comments = parts.length > 2 ? parts[2].trim() : undefined;
        
        if (name && email && email.includes('@')) {
          parsed.push({ name, email, comments });
        } else {
          errors.push(`Ligne ${i + 1}: format invalide (${line})`);
        }
      } else {
        // Try "Name email@domain.com" format
        const emailMatch = line.match(/(\S+@\S+\.\S+)/);
        if (emailMatch) {
          const email = emailMatch[0];
          const name = line.replace(email, '').trim();
          if (name) {
            parsed.push({ name, email });
          } else {
            errors.push(`Ligne ${i + 1}: nom manquant (${line})`);
          }
        } else {
          errors.push(`Ligne ${i + 1}: email non trouvé (${line})`);
        }
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Erreurs de format",
        description: `${errors.length} ligne(s) ignorée(s). Voir la console pour détails.`,
        variant: "destructive",
      });
      console.warn("Erreurs de parsing:", errors);
    }

    return parsed;
  };

  const handleBulkTextChange = (text: string) => {
    setBulkText(text);
    if (text.trim()) {
      const parsed = parseInscriptionsText(text);
      setParsedInscriptions(parsed);
    } else {
      setParsedInscriptions([]);
    }
  };

  const handleBulkImport = () => {
    if (!event || parsedInscriptions.length === 0) {
      toast({
        title: "Aucune inscription",
        description: "Veuillez ajouter des inscriptions à importer",
        variant: "destructive",
      });
      return;
    }

    bulkImportMutation.mutate({
      eventId: event.id,
      inscriptions: parsedInscriptions,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogHeader className="text-left pb-4">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-cjd-green" />
            Gérer les inscriptions
          </DialogTitle>
          <DialogDescription className="text-sm">
            Événement: <span className="font-medium">{event.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{inscriptions?.length || 0}</div>
                  <div className="text-gray-600">Inscrits</div>
                </div>
                {event.maxParticipants && (
                  <>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {event.maxParticipants - (inscriptions?.length || 0)}
                      </div>
                      <div className="text-gray-600">Places restantes</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">{event.maxParticipants}</div>
                      <div className="text-gray-600">Places totales</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add inscription form */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Ajouter une inscription</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                  data-testid="button-toggle-add-form"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {showAddForm ? "Annuler" : "Ajouter"}
                </Button>
              </div>
            </CardHeader>
            {showAddForm && (
              <CardContent>
                <form onSubmit={handleAddInscription} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="add-name" className="text-sm">Nom complet *</Label>
                      <Input
                        id="add-name"
                        value={newInscription.name}
                        onChange={(e) => setNewInscription(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom du participant"
                        required
                        data-testid="input-add-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-email" className="text-sm">Email *</Label>
                      <Input
                        id="add-email"
                        type="email"
                        value={newInscription.email}
                        onChange={(e) => setNewInscription(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemple.com"
                        required
                        data-testid="input-add-email"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="add-comments" className="text-sm">Commentaires</Label>
                    <Input
                      id="add-comments"
                      value={newInscription.comments}
                      onChange={(e) => setNewInscription(prev => ({ ...prev, comments: e.target.value }))}
                      placeholder="Commentaires optionnels"
                      data-testid="input-add-comments"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={addInscriptionMutation.isPending}
                    className="bg-cjd-green hover:bg-cjd-green-dark"
                    data-testid="button-submit-inscription"
                  >
                    {addInscriptionMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ajout...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter l'inscription
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>

          {/* Bulk import section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Import en masse</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  data-testid="button-toggle-bulk-import"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  {showBulkImport ? "Annuler" : "Import"}
                </Button>
              </div>
              <CardDescription className="text-sm">
                Importez plusieurs inscrits rapidement via copier-coller
              </CardDescription>
            </CardHeader>
            {showBulkImport && (
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bulk-text" className="text-sm font-medium">
                      Liste des participants
                    </Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Formats supportés : "Nom,email" ou "Nom;email" ou "Nom email@domain.com" (un par ligne)
                    </p>
                    <Textarea
                      id="bulk-text"
                      value={bulkText}
                      onChange={(e) => handleBulkTextChange(e.target.value)}
                      placeholder={`Jean Dupont,jean@example.com
Marie Martin;marie@example.com  
Pierre Durand pierre@example.com
Claire Dubois,claire@example.com,Commentaire optionnel`}
                      className="min-h-32"
                      data-testid="textarea-bulk-import"
                    />
                  </div>
                  
                  {parsedInscriptions.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <FileText className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {parsedInscriptions.length} inscription(s) détectée(s)
                        </span>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {parsedInscriptions.map((inscription, index) => (
                          <div key={index} className="text-xs text-green-700">
                            {inscription.name} - {inscription.email}
                            {inscription.comments && ` (${inscription.comments})`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkImport}
                      disabled={bulkImportMutation.isPending || parsedInscriptions.length === 0}
                      className="bg-cjd-green hover:bg-cjd-green-dark"
                      data-testid="button-execute-bulk-import"
                    >
                      {bulkImportMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Import...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Importer {parsedInscriptions.length} inscription(s)
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setBulkText("");
                        setParsedInscriptions([]);
                      }}
                      disabled={bulkImportMutation.isPending}
                      data-testid="button-clear-bulk-import"
                    >
                      Vider
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Inscriptions table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Liste des inscrits</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
                </div>
              ) : inscriptions && inscriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Commentaires</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inscriptions.map((inscription) => (
                        <TableRow key={inscription.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              {inscription.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              <a 
                                href={`mailto:${inscription.email}`} 
                                className="text-blue-600 hover:underline"
                              >
                                {inscription.email}
                              </a>
                            </div>
                          </TableCell>
                          <TableCell>
                            {inscription.comments && (
                              <div className="flex items-start">
                                <MessageSquare className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                                <span className="text-sm text-gray-600">{inscription.comments}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(inscription.createdAt.toString())}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteInscription(inscription.id, inscription.name)}
                              disabled={deleteInscriptionMutation.isPending}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              data-testid={`button-delete-${inscription.id}`}
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
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune inscription</h3>
                  <p className="text-gray-500">Aucune personne n'est encore inscrite à cet événement.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}