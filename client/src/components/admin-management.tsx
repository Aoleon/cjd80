import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Settings, Trash2, Eye, EyeOff, Edit } from "lucide-react";
import { ADMIN_ROLES, type Admin } from "@shared/schema";

interface AdminManagementProps {
  currentUser: Admin;
}

export default function AdminManagement({ currentUser }: AdminManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [editInfoAdmin, setEditInfoAdmin] = useState<Admin | null>(null);
  const [resetPasswordAdmin, setResetPasswordAdmin] = useState<Admin | null>(null);
  
  // États pour les formulaires d'édition
  const [editInfoForm, setEditInfoForm] = useState({ firstName: "", lastName: "" });
  const [newPasswordForm, setNewPasswordForm] = useState({ password: "", confirmPassword: "" });

  // Helper pour convertir les valeurs DB vers les clés enum  
  const getKeyFromValue = (value: string): keyof typeof ADMIN_ROLES => {
    const entry = Object.entries(ADMIN_ROLES).find(([key, val]) => val === value);
    return (entry?.[0] || 'IDEAS_READER') as keyof typeof ADMIN_ROLES;
  };

  // Récupérer la liste des administrateurs
  const { data: admins, isLoading } = useQuery<Admin[]>({
    queryKey: ['/api/admin/administrators'],
    enabled: currentUser.role === 'super_admin'
  });

  // Mutation pour mettre à jour le rôle
  const updateRoleMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      apiRequest('PATCH', `/api/admin/administrators/${email}/role`, { role }),
    onSuccess: () => {
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'administrateur a été mis à jour."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/administrators'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du rôle",
        variant: "destructive"
      });
    }
  });

  // Mutation pour activer/désactiver
  const updateStatusMutation = useMutation({
    mutationFn: ({ email, isActive }: { email: string; isActive: boolean }) =>
      apiRequest('PATCH', `/api/admin/administrators/${encodeURIComponent(email)}/status`, { isActive }),
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'administrateur a été mis à jour."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/administrators'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du statut",
        variant: "destructive"
      });
    }
  });

  // Mutation pour supprimer
  const deleteAdminMutation = useMutation({
    mutationFn: (email: string) => apiRequest('DELETE', `/api/admin/administrators/${encodeURIComponent(email)}`),
    onSuccess: () => {
      toast({
        title: "Administrateur supprimé",
        description: "L'administrateur a été supprimé avec succès."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/administrators'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  });

  // Mutation pour modifier les informations
  const updateInfoMutation = useMutation({
    mutationFn: ({ email, info }: { email: string; info: { firstName: string; lastName: string } }) =>
      apiRequest('PATCH', `/api/admin/administrators/${encodeURIComponent(email)}/info`, info),
    onSuccess: () => {
      toast({
        title: "Informations mises à jour",
        description: "Les informations ont été mises à jour avec succès."
      });
      setEditInfoAdmin(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/administrators'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive"
      });
    }
  });

  // Mutation pour régénérer un mot de passe
  const resetPasswordMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      apiRequest('PATCH', `/api/admin/administrators/${encodeURIComponent(email)}/password`, { password }),
    onSuccess: () => {
      toast({
        title: "Mot de passe réinitialisé",
        description: "Le mot de passe a été mis à jour avec succès."
      });
      setResetPasswordAdmin(null);
      setNewPasswordForm({ password: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la réinitialisation",
        variant: "destructive"
      });
    }
  });

  const handleRoleChange = (admin: Admin, newRole: keyof typeof ADMIN_ROLES) => {
    updateRoleMutation.mutate({ email: admin.email, role: ADMIN_ROLES[newRole] });
  };

  const handleStatusToggle = (admin: Admin) => {
    updateStatusMutation.mutate({ email: admin.email, isActive: !admin.isActive });
  };

  const handleDelete = (admin: Admin) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'administrateur ${admin.email} ?`)) {
      deleteAdminMutation.mutate(admin.email);
    }
  };

  const handleEditInfo = (admin: Admin) => {
    setEditInfoAdmin(admin);
    setEditInfoForm({ 
      firstName: admin.firstName || "", 
      lastName: admin.lastName || "" 
    });
  };

  const handleSubmitInfoEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editInfoAdmin) {
      updateInfoMutation.mutate({ 
        email: editInfoAdmin.email, 
        info: editInfoForm 
      });
    }
  };

  const handleResetPassword = (admin: Admin) => {
    setResetPasswordAdmin(admin);
  };

  const handleSubmitPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordAdmin && newPasswordForm.password === newPasswordForm.confirmPassword) {
      resetPasswordMutation.mutate({
        email: resetPasswordAdmin.email,
        password: newPasswordForm.password
      });
    }
  };

  // Seuls les super admin peuvent voir cette interface
  if (currentUser.role !== 'super_admin') {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestion des Administrateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestion des Administrateurs
              </CardTitle>
              <CardDescription>
                Gérer les comptes administrateurs existants
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {admins && admins.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin: Admin) => (
                    <TableRow key={admin.email}>
                      <TableCell className="font-medium">{admin.email}</TableCell>
                      <TableCell>
                        {admin.firstName} {admin.lastName}
                        {admin.email === currentUser.email && (
                          <Badge variant="secondary" className="ml-2 text-xs">Vous</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={getKeyFromValue(admin.role)}
                          onValueChange={(value: keyof typeof ADMIN_ROLES) => handleRoleChange(admin, value)}
                          disabled={admin.email === currentUser.email}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IDEAS_READER">Consultation idées</SelectItem>
                            <SelectItem value="IDEAS_MANAGER">Gestion idées</SelectItem>
                            <SelectItem value="EVENTS_READER">Consultation événements</SelectItem>
                            <SelectItem value="EVENTS_MANAGER">Gestion événements</SelectItem>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={admin.isActive ? "default" : "secondary"}
                          size="sm"
                          onClick={() => handleStatusToggle(admin)}
                          disabled={admin.email === currentUser.email}
                        >
                          {admin.isActive ? "Actif" : "Inactif"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInfo(admin)}
                            disabled={admin.email === currentUser.email}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(admin)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(admin)}
                            disabled={admin.email === currentUser.email}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">Aucun administrateur trouvé</p>
          )}
        </CardContent>
      </Card>

      {/* Dialogue d'édition des informations */}
      <Dialog open={!!editInfoAdmin} onOpenChange={() => setEditInfoAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les informations</DialogTitle>
            <DialogDescription>
              Modifier les informations de {editInfoAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitInfoEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFirstName">Prénom</Label>
              <Input
                id="editFirstName"
                value={editInfoForm.firstName}
                onChange={(e) => setEditInfoForm(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLastName">Nom</Label>
              <Input
                id="editLastName"
                value={editInfoForm.lastName}
                onChange={(e) => setEditInfoForm(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={updateInfoMutation.isPending}>
                {updateInfoMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditInfoAdmin(null)}>
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de réinitialisation du mot de passe */}
      <Dialog open={!!resetPasswordAdmin} onOpenChange={() => setResetPasswordAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              Définir un nouveau mot de passe pour {resetPasswordAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPasswordForm.password}
                onChange={(e) => setNewPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={newPasswordForm.confirmPassword}
                onChange={(e) => setNewPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                minLength={8}
                required
              />
            </div>
            {newPasswordForm.password !== newPasswordForm.confirmPassword && newPasswordForm.confirmPassword && (
              <p className="text-red-500 text-sm">Les mots de passe ne correspondent pas</p>
            )}
            <div className="flex justify-end gap-2">
              <Button 
                type="submit" 
                disabled={resetPasswordMutation.isPending || newPasswordForm.password !== newPasswordForm.confirmPassword}
              >
                {resetPasswordMutation.isPending ? "Réinitialisation..." : "Réinitialiser"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setResetPasswordAdmin(null)}>
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}