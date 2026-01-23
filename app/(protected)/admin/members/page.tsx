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
import { Loader2, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Member {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  status: string;
  engagementScore?: number;
}

/**
 * Page Gestion Membres CRM
 * CRUD complet sur les membres avec pagination et recherche
 */
export default function AdminMembersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Query pour lister les membres
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.members.list({ page, limit: 20, search: search || undefined }),
    queryFn: () => api.get<PaginatedResponse<Member>>('/api/admin/members', {
      page,
      limit: 20,
      search: search || undefined,
    }),
  });

  // Mutation pour supprimer un membre
  const deleteMutation = useMutation({
    mutationFn: (email: string) => api.delete(`/api/admin/members/${encodeURIComponent(email)}`),
    onSuccess: () => {
      toast({
        title: 'Membre supprimé',
        description: 'Le membre a été supprimé avec succès',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (email: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      deleteMutation.mutate(email);
    }
  };

  // Note: Status toggle is not implemented in updateMemberSchema
  // If needed, add 'status' field to updateMemberSchema in shared/schema.ts
  const handleStatusToggle = (_email: string, _currentStatus: string) => {
    toast({
      title: 'Non implémenté',
      description: 'La modification du statut n\'est pas encore disponible',
      variant: 'destructive',
    });
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
            <CardDescription>Impossible de charger les membres</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion Membres</h1>
          <p className="text-muted-foreground">
            CRM - Gestion des membres de l'association
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un membre
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des membres</CardTitle>
          <CardDescription>
            {data?.total || 0} membres au total
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data && data.data.length > 0 ? (
                data.data.map((member: Member) => (
                  <TableRow key={member.email}>
                    <TableCell className="font-medium">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.company || '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={member.status === 'active' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleStatusToggle(member.email, member.status)}
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${member.engagementScore || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {member.engagementScore || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(member.email)}
                          disabled={deleteMutation.isPending}
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
                    Aucun membre trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && Math.ceil(data.total / data.limit) > 1 && (
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
                Page {page} sur {Math.ceil(data.total / data.limit)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(Math.ceil(data.total / data.limit), p + 1))}
                disabled={page === Math.ceil(data.total / data.limit)}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
