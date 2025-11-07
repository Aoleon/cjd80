import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { LoanItem, LOAN_STATUS } from "@shared/schema";

interface PaginatedLoanItemsResponse {
  data: LoanItem[];
  total: number;
  page: number;
  limit: number;
}

export function useAdminLoanItems(enabled: boolean = true) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<PaginatedLoanItemsResponse>({
    queryKey: ["/api/admin/loan-items"],
    queryFn: async () => {
      const res = await fetch("/api/admin/loan-items?page=1&limit=1000");
      if (!res.ok) throw new Error("Failed to fetch loan items");
      const json = await res.json();
      // Gérer la nouvelle structure de réponse { success: true, data: {...} }
      if (json.success && json.data) {
        return json.data;
      }
      // Fallback pour l'ancienne structure
      return json;
    },
    enabled,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/loan-items/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de la mise à jour");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loan-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-items"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut du matériel a été modifié avec succès.",
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

  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LoanItem> }) => {
      const res = await fetch(`/api/admin/loan-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de la mise à jour");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loan-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-items"] });
      toast({
        title: "Matériel mis à jour",
        description: "Les informations ont été modifiées avec succès.",
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

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/loan-items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loan-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-items"] });
      toast({
        title: "Matériel supprimé",
        description: "Le matériel a été supprimé avec succès.",
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

  const uploadPhoto = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("photo", file);
      
      const res = await fetch(`/api/admin/loan-items/${id}/photo`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de l'upload");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loan-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-items"] });
      toast({
        title: "Photo uploadée",
        description: "La photo a été uploadée avec succès.",
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

  return {
    loanItems: data?.data || [],
    isLoading,
    updateStatus,
    updateItem,
    deleteItem,
    uploadPhoto,
    isUpdatingStatus: updateStatus.isPending,
    isDeleting: deleteItem.isPending,
    isUploadingPhoto: uploadPhoto.isPending,
  };
}

