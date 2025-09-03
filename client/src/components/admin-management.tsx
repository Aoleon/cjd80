import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { Eye, EyeOff, Plus, Edit2, Trash2, Shield } from "lucide-react";
import type { Admin } from "@shared/schema";
import { ADMIN_ROLES } from "@shared/schema";

interface AdminManagementProps {
  currentUser: Admin;
}

export default function AdminManagement({ currentUser }: AdminManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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

  // État pour le formulaire de création
  const [createForm, setCreateForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "IDEAS_READER" as keyof typeof ADMIN_ROLES
  });

  // Récupérer la liste des administrateurs
  const { data: admins, isLoading } = useQuery({
    queryKey: ['/api/admin/administrators'],
    enabled: currentUser.role === 'super_admin'
  });

  // Mutation pour créer un administrateur
  const createAdminMutation = useMutation({
    mutationFn: (data: typeof createForm) => 
      apiRequest('POST', '/api/admin/administrators', {
        ...data,
        role: ADMIN_ROLES[data.role] // Convertir la clé en valeur
      }),
    onSuccess: () => {
      toast({
        title: "Administrateur créé",
        description: "Le nouvel administrateur a été créé avec succès."
      });
      setIsCreateDialogOpen(false);
      setCreateForm({ email: "", firstName: "", lastName: "", password: "", role: "IDEAS_READER" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/administrators'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de l'administrateur",
        variant: "destructive"
      });
    }
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
      apiRequest('PATCH', `/api/admin/administrators/${email}/status`, { isActive }),
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
    mutationFn: (email: string) =>
      apiRequest('DELETE', `/api/admin/administrators/${email}`, undefined),
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

  // Mutation pour modifier les informations d'un administrateur
  const updateInfoMutation = useMutation({
    mutationFn: ({ email, info }: { email: string; info: { firstName: string; lastName: string } }) => 
      apiRequest('PATCH', `/api/admin/administrators/${encodeURIComponent(email)}/info`, info),
    onSuccess: () => {
      toast({
        title: "Informations mises à jour",
        description: "Les informations de l'administrateur ont été mises à jour avec succès."
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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAdminMutation.mutate(createForm);
  };

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
    setNewPasswordForm({ password: "", confirmPassword: "" });
  };

  const handleSubmitPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordAdmin && newPasswordForm.password === newPasswordForm.confirmPassword && newPasswordForm.password) {
      resetPasswordMutation.mutate({ 
        email: resetPasswordAdmin.email, 
        password: newPasswordForm.password 
      });
    }
  };

  // Vérifier si l'utilisateur est super admin
  if (currentUser.role !== 'super_admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestion des Administrateurs
          </CardTitle>
          <CardDescription>
            Accès restreint aux super-administrateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </CardContent>
      </Card>
    );
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Gestion des Administrateurs
            </CardTitle>
            <CardDescription>
              Créer et gérer les comptes administrateurs
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-admin">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Administrateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un Administrateur</DialogTitle>
                <DialogDescription>
                  Ajouter un nouvel administrateur au système
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      type="text"
                      data-testid="input-admin-firstName"
                      value={createForm.firstName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      placeholder="Ex: Jean"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      type="text"
                      data-testid="input-admin-lastName"
                      value={createForm.lastName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      placeholder="Ex: Dupont"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-admin-email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="Ex: jean.dupont@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      data-testid="input-admin-password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={8}
                      placeholder="Ex: MonMotDePasse123"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="font-medium text-blue-800">📋 Le mot de passe doit contenir :</p>
                    <ul className="mt-1 space-y-0.5 text-blue-700">
                      <li>• Au moins 8 caractères</li>
                      <li>• 1 majuscule (A-Z)</li>
                      <li>• 1 minuscule (a-z)</li>
                      <li>• 1 chiffre (0-9)</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select
                    value={createForm.role}
                    onValueChange={(value: keyof typeof ADMIN_ROLES) => 
                      setCreateForm(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger data-testid="select-admin-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDEAS_READER">Lecture Idées</SelectItem>
                      <SelectItem value="IDEAS_MANAGER">Gestion Idées</SelectItem>
                      <SelectItem value="EVENTS_READER">Lecture Événements</SelectItem>
                      <SelectItem value="EVENTS_MANAGER">Gestion Événements</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createAdminMutation.isPending}
                    data-testid="button-submit-admin"
                  >
                    {createAdminMutation.isPending ? "Création..." : "Créer"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-admin"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(admins as any)?.map((admin: Admin) => (
            <div 
              key={admin.email} 
              className="flex items-center justify-between p-4 border rounded-lg"
              data-testid={`admin-card-${admin.email}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium" data-testid={`text-admin-name-${admin.email}`}>
                    {admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : admin.email}
                  </h3>
                  <span 
                    className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    data-testid={`badge-admin-role-${admin.email}`}
                  >
                    {admin.role.replace('_', ' ')}
                  </span>
                  <span 
                    className={`px-2 py-1 text-xs rounded-full ${
                      admin.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                    data-testid={`badge-admin-status-${admin.email}`}
                  >
                    {admin.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground" data-testid={`text-admin-email-${admin.email}`}>
                  {admin.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ajouté le {new Date(admin.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              {admin.email !== currentUser.email && (
                <div className="flex items-center gap-2">
                  <Select
                    value={getKeyFromValue(admin.role)}
                    onValueChange={(value) => handleRoleChange(admin, value as keyof typeof ADMIN_ROLES)}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-32" data-testid={`select-role-${admin.email}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDEAS_READER">Lecture Idées</SelectItem>
                      <SelectItem value="IDEAS_MANAGER">Gestion Idées</SelectItem>
                      <SelectItem value="EVENTS_READER">Lecture Événements</SelectItem>
                      <SelectItem value="EVENTS_MANAGER">Gestion Événements</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditInfo(admin)}
                    disabled={updateInfoMutation.isPending}
                    data-testid={`button-edit-info-${admin.email}`}
                    title="Modifier nom et prénom"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleResetPassword(admin)}
                    disabled={resetPasswordMutation.isPending}
                    data-testid={`button-reset-password-${admin.email}`}
                    title="Réinitialiser le mot de passe"
                  >
                    🔑
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusToggle(admin)}
                    disabled={updateStatusMutation.isPending}
                    data-testid={`button-toggle-status-${admin.email}`}
                  >
                    {admin.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(admin)}
                    disabled={deleteAdminMutation.isPending}
                    data-testid={`button-delete-${admin.email}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {(admins as any)?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Aucun administrateur trouvé
            </p>
          )}
        </div>
      </CardContent>

      {/* Modal pour modifier les informations */}
      <Dialog open={!!editInfoAdmin} onOpenChange={(open) => !open && setEditInfoAdmin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier les informations</DialogTitle>
            <DialogDescription>
              Modifier le nom et prénom de {editInfoAdmin?.firstName} {editInfoAdmin?.lastName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitInfoEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">Prénom</Label>
                <Input
                  id="editFirstName"
                  type="text"
                  data-testid="input-edit-firstName"
                  value={editInfoForm.firstName}
                  onChange={(e) => setEditInfoForm(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Nom</Label>
                <Input
                  id="editLastName"
                  type="text"
                  data-testid="input-edit-lastName"
                  value={editInfoForm.lastName}
                  onChange={(e) => setEditInfoForm(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  placeholder="Nom de famille"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditInfoAdmin(null)}
                data-testid="button-cancel-edit-info"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={updateInfoMutation.isPending}
                data-testid="button-submit-edit-info"
              >
                {updateInfoMutation.isPending ? "Modification..." : "Modifier"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal pour réinitialiser le mot de passe */}
      <Dialog open={!!resetPasswordAdmin} onOpenChange={(open) => !open && setResetPasswordAdmin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              Définir un nouveau mot de passe pour {resetPasswordAdmin?.firstName} {resetPasswordAdmin?.lastName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                data-testid="input-new-password"
                value={newPasswordForm.password}
                onChange={(e) => setNewPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={8}
                placeholder="Ex: NouveauMotDePasse123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                data-testid="input-confirm-password"
                value={newPasswordForm.confirmPassword}
                onChange={(e) => setNewPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={8}
                placeholder="Répéter le mot de passe"
              />
              {newPasswordForm.password && newPasswordForm.confirmPassword && 
               newPasswordForm.password !== newPasswordForm.confirmPassword && (
                <p className="text-sm text-red-600">Les mots de passe ne correspondent pas</p>
              )}
            </div>
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
              <p className="font-medium text-blue-800">📋 Le mot de passe doit contenir :</p>
              <ul className="mt-1 space-y-0.5 text-blue-700">
                <li>• Au moins 8 caractères</li>
                <li>• 1 majuscule (A-Z)</li>
                <li>• 1 minuscule (a-z)</li>
                <li>• 1 chiffre (0-9)</li>
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setResetPasswordAdmin(null)}
                data-testid="button-cancel-reset-password"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={resetPasswordMutation.isPending || newPasswordForm.password !== newPasswordForm.confirmPassword}
                data-testid="button-submit-reset-password"
              >
                {resetPasswordMutation.isPending ? "Modification..." : "Réinitialiser"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}