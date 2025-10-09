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
import { Shield, Settings, Trash2, Eye, EyeOff, Edit, Plus } from "lucide-react";
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
  const [createAdminModalOpen, setCreateAdminModalOpen] = useState(false);
  
  // États pour les formulaires d'édition
  const [editInfoForm, setEditInfoForm] = useState({ firstName: "", lastName: "" });
  const [newPasswordForm, setNewPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [createAdminForm, setCreateAdminForm] = useState<{
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    role: string;
  }>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: ADMIN_ROLES.IDEAS_READER
  });

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

  // Mutation pour créer un nouvel administrateur
  const createAdminMutation = useMutation({
    mutationFn: (adminData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
    }) => apiRequest('POST', '/api/admin/administrators', adminData),
    onSuccess: () => {
      toast({
        title: "Administrateur créé",
        description: "Le nouvel administrateur a été créé avec succès."
      });
      setCreateAdminModalOpen(false);
      setCreateAdminForm({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        role: ADMIN_ROLES.IDEAS_READER
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/administrators'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création",
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

  const handleSubmitCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (createAdminForm.password === createAdminForm.confirmPassword) {
      createAdminMutation.mutate({
        email: createAdminForm.email,
        password: createAdminForm.password,
        firstName: createAdminForm.firstName,
        lastName: createAdminForm.lastName,
        role: createAdminForm.role
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
            <Button
              onClick={() => setCreateAdminModalOpen(true)}
              className="bg-info hover:bg-info-dark"
              data-testid="button-create-admin"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Admin
            </Button>
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
              <p className="text-error text-sm">Les mots de passe ne correspondent pas</p>
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

      {/* Dialogue de création d'un nouvel administrateur */}
      <Dialog open={createAdminModalOpen} onOpenChange={setCreateAdminModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un Nouvel Administrateur</DialogTitle>
            <DialogDescription>
              Créer un compte administrateur avec accès immédiat
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreateAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="createEmail">Email</Label>
              <Input
                id="createEmail"
                type="email"
                value={createAdminForm.email}
                onChange={(e) => setCreateAdminForm(prev => ({ ...prev, email: e.target.value }))}
                required
                data-testid="input-create-email"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="createFirstName">Prénom</Label>
                <Input
                  id="createFirstName"
                  value={createAdminForm.firstName}
                  onChange={(e) => setCreateAdminForm(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  data-testid="input-create-firstName"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="createLastName">Nom</Label>
                <Input
                  id="createLastName"
                  value={createAdminForm.lastName}
                  onChange={(e) => setCreateAdminForm(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  data-testid="input-create-lastName"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="createRole">Rôle</Label>
              <Select
                value={createAdminForm.role}
                onValueChange={(value) => setCreateAdminForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger data-testid="select-create-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ADMIN_ROLES.IDEAS_READER}>Lecteur d'Idées</SelectItem>
                  <SelectItem value={ADMIN_ROLES.IDEAS_MANAGER}>Gestionnaire d'Idées</SelectItem>
                  <SelectItem value={ADMIN_ROLES.EVENTS_READER}>Lecteur d'Événements</SelectItem>
                  <SelectItem value={ADMIN_ROLES.EVENTS_MANAGER}>Gestionnaire d'Événements</SelectItem>
                  <SelectItem value={ADMIN_ROLES.SUPER_ADMIN}>Super Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="createPassword">Mot de passe</Label>
              <Input
                id="createPassword"
                type="password"
                value={createAdminForm.password}
                onChange={(e) => setCreateAdminForm(prev => ({ ...prev, password: e.target.value }))}
                minLength={8}
                required
                data-testid="input-create-password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="createConfirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="createConfirmPassword"
                type="password"
                value={createAdminForm.confirmPassword}
                onChange={(e) => setCreateAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                minLength={8}
                required
                data-testid="input-create-confirmPassword"
              />
            </div>
            
            {createAdminForm.password !== createAdminForm.confirmPassword && createAdminForm.confirmPassword && (
              <p className="text-error text-sm">Les mots de passe ne correspondent pas</p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateAdminModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={createAdminMutation.isPending || createAdminForm.password !== createAdminForm.confirmPassword}
                className="bg-info hover:bg-info-dark"
                data-testid="button-submit-create-admin"
              >
                {createAdminMutation.isPending ? "Création..." : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}