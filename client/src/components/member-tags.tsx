import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Loader2, Plus, X, Tag } from "lucide-react";
import type { MemberTag } from "@shared/schema";

const createTagSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format hex invalide"),
  description: z.string().max(500).optional(),
});

type CreateTagFormValues = z.infer<typeof createTagSchema>;

interface MemberTagsProps {
  memberEmail: string;
}

export function MemberTags({ memberEmail }: MemberTagsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Récupérer tous les tags disponibles
  const { data: allTags = [], isLoading: tagsLoading } = useQuery<MemberTag[]>({
    queryKey: ["/api/admin/member-tags"],
    queryFn: async () => {
      const res = await fetch("/api/admin/member-tags");
      if (!res.ok) throw new Error("Failed to fetch tags");
      const data = await res.json();
      return data.data || [];
    },
  });

  // Récupérer les tags assignés au membre
  const { data: memberTags = [], isLoading: memberTagsLoading, refetch } = useQuery<MemberTag[]>({
    queryKey: ["/api/admin/members", memberEmail, "tags"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(memberEmail)}/tags`);
      if (!res.ok) throw new Error("Failed to fetch member tags");
      const data = await res.json();
      return data.data || [];
    },
  });

  const createTagForm = useForm<CreateTagFormValues>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      description: "",
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async (data: CreateTagFormValues) => {
      return apiRequest("POST", "/api/admin/member-tags", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/member-tags"] });
      toast({ title: "Tag créé avec succès" });
      setShowCreateDialog(false);
      createTagForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le tag",
        variant: "destructive",
      });
    },
  });

  const assignTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      return apiRequest("POST", `/api/admin/members/${encodeURIComponent(memberEmail)}/tags`, {
        tagId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", memberEmail, "tags"] });
      toast({ title: "Tag assigné avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner le tag",
        variant: "destructive",
      });
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      return apiRequest("DELETE", `/api/admin/members/${encodeURIComponent(memberEmail)}/tags/${tagId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members", memberEmail, "tags"] });
      toast({ title: "Tag retiré avec succès" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de retirer le tag",
        variant: "destructive",
      });
    },
  });

  const handleCreateTag = createTagForm.handleSubmit((data) => {
    createTagMutation.mutate(data);
  });

  const assignedTagIds = new Set(memberTags.map(tag => tag.id));
  const availableTags = allTags.filter(tag => !assignedTagIds.has(tag.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tags</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Créer un tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau tag</DialogTitle>
              <DialogDescription>
                Créez un tag personnalisable pour catégoriser les membres
              </DialogDescription>
            </DialogHeader>
            <Form {...createTagForm}>
              <form onSubmit={handleCreateTag} className="space-y-4">
                <FormField
                  control={createTagForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du tag</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VIP, Ambassadeur, etc." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createTagForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input type="color" {...field} className="w-20" />
                          <Input {...field} placeholder="#3b82f6" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createTagForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optionnelle)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Description du tag" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={createTagMutation.isPending}
                  className="w-full"
                >
                  {createTagMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer le tag"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tags assignés */}
      {memberTagsLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : memberTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {memberTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color, color: "white" }}
              className="px-3 py-1 flex items-center gap-2"
            >
              <Tag className="h-3 w-3" />
              {tag.name}
              <button
                onClick={() => removeTagMutation.mutate(tag.id)}
                className="ml-1 hover:opacity-70"
                disabled={removeTagMutation.isPending}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Aucun tag assigné</p>
      )}

      {/* Assigner un tag */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Assigner un tag</label>
          <Select
            onValueChange={(tagId) => assignTagMutation.mutate(tagId)}
            disabled={assignTagMutation.isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un tag..." />
            </SelectTrigger>
            <SelectContent>
              {availableTags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

