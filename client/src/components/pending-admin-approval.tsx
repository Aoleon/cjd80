import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";
import { ADMIN_ROLES, type Admin } from "@shared/schema";

interface PendingAdminApprovalProps {
  currentUser: Admin;
}

export default function PendingAdminApproval({ currentUser }: PendingAdminApprovalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [approvalDialog, setApprovalDialog] = useState<{ admin: Admin | null; role: string }>({ 
    admin: null, 
    role: ADMIN_ROLES.IDEAS_READER 
  });

  // Récupérer les comptes en attente
  const { data: pendingAdmins, isLoading } = useQuery<Admin[]>({
    queryKey: ['/api/admin/pending-admins'],
    enabled: currentUser.role === 'super_admin',
    select: (data: any) => data?.data || []
  });

  // Mutation pour approuver un compte
  const approveMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      apiRequest('PATCH', `/api/admin/administrators/${encodeURIComponent(email)}/approve`, { role }),
    onSuccess: () => {
      toast({
        title: "Compte approuvé",
        description: "Le compte administrateur a été approuvé avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-admins'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/administrators'] });
      setApprovalDialog({ admin: null, role: ADMIN_ROLES.IDEAS_READER });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'approbation du compte",
        variant: "destructive"
      });
    }
  });

  // Mutation pour rejeter un compte
  const rejectMutation = useMutation({
    mutationFn: (email: string) =>
      apiRequest('DELETE', `/api/admin/administrators/${encodeURIComponent(email)}/reject`),
    onSuccess: () => {
      toast({
        title: "Compte rejeté",
        description: "Le compte a été rejeté et supprimé."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-admins'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du rejet du compte",
        variant: "destructive"
      });
    }
  });

  const handleApprove = () => {
    if (approvalDialog.admin) {
      approveMutation.mutate({
        email: approvalDialog.admin.email,
        role: approvalDialog.role
      });
    }
  };

  const handleReject = (admin: Admin) => {
    if (confirm(`Êtes-vous sûr de vouloir rejeter le compte de ${admin.firstName} ${admin.lastName} (${admin.email}) ?`)) {
      rejectMutation.mutate(admin.email);
    }
  };

  // Fonction pour obtenir le nom d'affichage du rôle
  const getRoleDisplayName = (roleValue: string) => {
    switch (roleValue) {
      case ADMIN_ROLES.SUPER_ADMIN: return "Super Administrateur";
      case ADMIN_ROLES.IDEAS_MANAGER: return "Gestionnaire d'Idées";
      case ADMIN_ROLES.IDEAS_READER: return "Lecteur d'Idées";
      case ADMIN_ROLES.EVENTS_MANAGER: return "Gestionnaire d'Événements";
      case ADMIN_ROLES.EVENTS_READER: return "Lecteur d'Événements";
      default: return roleValue;
    }
  };

  if (currentUser.role !== 'super_admin') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-warning-dark" />
          Comptes en Attente de Validation
        </CardTitle>
        <CardDescription>
          Approuvez ou rejetez les nouvelles demandes d'inscription d'administrateurs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
            <p className="text-gray-500">Chargement des comptes en attente...</p>
          </div>
        ) : pendingAdmins && pendingAdmins.length > 0 ? (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAdmins.map((admin) => (
                  <TableRow key={admin.email}>
                    <TableCell className="font-medium">
                      {admin.firstName} {admin.lastName}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      {new Date(admin.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-warning-light text-warning-dark">
                        <Clock className="w-3 h-3 mr-1" />
                        En attente
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Dialog 
                          open={approvalDialog.admin?.email === admin.email} 
                          onOpenChange={(open) => !open && setApprovalDialog({ admin: null, role: ADMIN_ROLES.IDEAS_READER })}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success-dark text-white"
                              onClick={() => setApprovalDialog({ admin, role: ADMIN_ROLES.IDEAS_READER })}
                              disabled={approveMutation.isPending}
                              data-testid={`button-approve-${admin.email}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approuver
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approuver le compte</DialogTitle>
                              <DialogDescription>
                                Sélectionnez le rôle à attribuer à {admin.firstName} {admin.lastName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Rôle à attribuer</label>
                                <Select
                                  value={approvalDialog.role}
                                  onValueChange={(value) => setApprovalDialog(prev => ({ ...prev, role: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={ADMIN_ROLES.IDEAS_READER}>
                                      Lecteur d'Idées
                                    </SelectItem>
                                    <SelectItem value={ADMIN_ROLES.IDEAS_MANAGER}>
                                      Gestionnaire d'Idées
                                    </SelectItem>
                                    <SelectItem value={ADMIN_ROLES.EVENTS_READER}>
                                      Lecteur d'Événements
                                    </SelectItem>
                                    <SelectItem value={ADMIN_ROLES.EVENTS_MANAGER}>
                                      Gestionnaire d'Événements
                                    </SelectItem>
                                    <SelectItem value={ADMIN_ROLES.SUPER_ADMIN}>
                                      Super Administrateur
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => setApprovalDialog({ admin: null, role: ADMIN_ROLES.IDEAS_READER })}
                                >
                                  Annuler
                                </Button>
                                <Button
                                  onClick={handleApprove}
                                  disabled={approveMutation.isPending}
                                  className="bg-success hover:bg-success-dark"
                                >
                                  {approveMutation.isPending ? "Approbation..." : "Confirmer"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(admin)}
                          disabled={rejectMutation.isPending}
                          data-testid={`button-reject-${admin.email}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeter
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
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun compte en attente</h3>
            <p className="text-gray-500">Tous les comptes d'administrateur ont été traités</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}