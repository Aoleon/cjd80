import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, invalidateAndRefetch } from "@/lib/queryClient";
import { IDEA_STATUS } from "@shared/schema";
import type { IdeaWithVotes } from "@/types/admin";

export function useAdminIdeas(enabled: boolean = true) {
  const { toast } = useToast();

  const ideasQuery = useQuery<IdeaWithVotes[]>({
    queryKey: ["/api/admin/ideas"],
    queryFn: async () => {
      const res = await fetch('/api/admin/ideas?limit=1000');
      if (!res.ok) throw new Error('Failed to fetch ideas');
      return res.json();
    },
    enabled,
  });

  const sortedIdeas = useMemo(() => {
    if (!ideasQuery.data) return [];
    
    const statusOrder: Record<string, number> = {
      [IDEA_STATUS.PENDING]: 1,
      [IDEA_STATUS.UNDER_REVIEW]: 2,
      [IDEA_STATUS.APPROVED]: 3,
      [IDEA_STATUS.POSTPONED]: 4,
      [IDEA_STATUS.REJECTED]: 5,
      [IDEA_STATUS.COMPLETED]: 6,
    };

    return [...ideasQuery.data].sort((a, b) => {
      const statusDiff = (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [ideasQuery.data]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ideas/${id}`);
    },
    onSuccess: () => {
      invalidateAndRefetch(["/api/admin/ideas"]);
      invalidateAndRefetch(["/api/ideas"]);
      toast({
        title: "Idée supprimée",
        description: "L'idée a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'idée",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/ideas/${id}/status`, { status });
    },
    onSuccess: () => {
      invalidateAndRefetch(["/api/admin/ideas"]);
      invalidateAndRefetch(["/api/ideas"]);
      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'idée a été mis à jour",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'idée",
        variant: "destructive",
      });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/admin/ideas/${id}/featured`);
    },
    onSuccess: () => {
      invalidateAndRefetch(["/api/admin/ideas"]);
      invalidateAndRefetch(["/api/ideas"]);
      toast({
        title: "Mise en avant modifiée",
        description: "Le statut de mise en avant de l'idée a été modifié",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la mise en avant de l'idée",
        variant: "destructive",
      });
    },
  });

  const convertToEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/admin/ideas/${id}/transform-to-event`, {});
    },
    onSuccess: () => {
      invalidateAndRefetch(["/api/admin/ideas"]);
      invalidateAndRefetch(["/api/admin/events"]);
      invalidateAndRefetch(["/api/ideas"]);
      invalidateAndRefetch(["/api/events"]);
      toast({
        title: "Idée transformée",
        description: "L'idée a été transformée en événement avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de transformation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    ideas: sortedIdeas,
    isLoading: ideasQuery.isLoading,
    deleteIdea: deleteMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    toggleFeatured: toggleFeaturedMutation.mutate,
    convertToEvent: convertToEventMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isTogglingFeatured: toggleFeaturedMutation.isPending,
    isConverting: convertToEventMutation.isPending,
  };
}
