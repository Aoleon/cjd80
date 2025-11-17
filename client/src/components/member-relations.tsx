import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Users, X, UserCheck } from "lucide-react";
import { useQuery as useMembersQuery } from "@tanstack/react-query";
import type { MemberRelation, Member } from "@shared/schema";

const createRelationSchema = z.object({
  relatedMemberEmail: z.string().email("Email invalide"),
  relationType: z.enum(['sponsor', 'team', 'custom']),
  description: z.string().max(500).optional(),
});

type CreateRelationFormValues = z.infer<typeof createRelationSchema>;

interface MemberRelationsProps {
  memberEmail: string;
}

const RELATION_TYPE_LABELS = {
  sponsor: "Parrainage",
  team: "Équipe",
  custom: "Personnalisé",
};

export function MemberRelations({ memberEmail }: MemberRelationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Récupérer tous les membres pour le select
  const { data: membersResponse } = useMembersQuery<{ data: Member[] }>({
    queryKey: ["/api/admin/members", 1, 100],
    queryFn: async () => {
      const res = await fetch("/api/admin/members?page=1&limit=100");
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
  });

  const members = membersResponse?.data || [];

  const { data: relations = [], isLoading: relationsLoading, refetch } = useQuery<MemberRelation[]>({
    queryKey: ["/api/admin/members", memberEmail, "relations"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(memberEmail)}/relations`);
      if (!res.ok) throw new Error("Failed to fetch relations");
      const data = await res.json();
      return data.data || [];
    },
  });

  const createRelationForm = useForm<CreateRelationFormValues>({
    resolver: zodResolver(createRelationSchema),
    defaultValues: {
      relatedMemberEmail: "",
      relationType: "sponsor",
      description: "",
    },
  });

  const createRelationMutation = useMutation({
    mutationFn: async (data: CreateRelationFormValues) => {
      return apiRequest("POST", `/api/admin/members/${encodeURIComponent(memberEmail)}/relations`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", memberEmail, "relations"] });
      toast({ title: "Relation créée avec succès" });
      setShowCreateDialog(false);
      createRelationForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la relation",
        variant: "destructive",
      });
    },
  });

  const deleteRelationMutation = useMutation({
    mutationFn: async (relationId: string) => {
      return apiRequest("DELETE", `/api/admin/member-relations/${relationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", memberEmail, "relations"] });
      toast({ title: "Relation supprimée" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la relation",
        variant: "destructive",
      });
    },
  });

  const handleCreateRelation = createRelationForm.handleSubmit((data) => {
    createRelationMutation.mutate(data);
  });

  const getRelatedMember = (email: string) => {
    return members.find(m => m.email === email);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Relations</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une relation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une relation</DialogTitle>
              <DialogDescription>
                Lier ce membre à un autre membre (parrainage, équipe, etc.)
              </DialogDescription>
            </DialogHeader>
            <Form {...createRelationForm}>
              <form onSubmit={handleCreateRelation} className="space-y-4">
                <FormField
                  control={createRelationForm.control}
                  name="relatedMemberEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membre lié</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un membre..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members
                            .filter(m => m.email !== memberEmail)
                            .map((member) => (
                              <SelectItem key={member.email} value={member.email}>
                                {member.firstName} {member.lastName} ({member.email})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createRelationForm.control}
                  name="relationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de relation</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sponsor">Parrainage</SelectItem>
                          <SelectItem value="team">Équipe</SelectItem>
                          <SelectItem value="custom">Personnalisé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createRelationForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optionnelle)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Détails de la relation..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={createRelationMutation.isPending}
                  className="w-full"
                >
                  {createRelationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer la relation"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {relationsLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : relations.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune relation enregistrée</p>
      ) : (
        <div className="space-y-3">
          {relations.map((relation) => {
            const relatedEmail = relation.memberEmail === memberEmail 
              ? relation.relatedMemberEmail 
              : relation.memberEmail;
            const relatedMember = getRelatedMember(relatedEmail);
            const isOutgoing = relation.memberEmail === memberEmail;

            return (
              <Card key={relation.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {isOutgoing ? <UserCheck className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                        <h4 className="font-medium">
                          {relatedMember 
                            ? `${relatedMember.firstName} ${relatedMember.lastName}`
                            : relatedEmail}
                        </h4>
                        <Badge variant="secondary">
                          {RELATION_TYPE_LABELS[relation.relationType as keyof typeof RELATION_TYPE_LABELS]}
                        </Badge>
                      </div>
                      {relatedMember && (
                        <p className="text-sm text-muted-foreground">{relatedMember.email}</p>
                      )}
                      {relation.description && (
                        <p className="text-sm text-muted-foreground">{relation.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(relation.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteRelationMutation.mutate(relation.id)}
                      disabled={deleteRelationMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

