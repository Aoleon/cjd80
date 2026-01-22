"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, User, Image as ImageIcon, Calendar, Mail, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, invalidateAndRefetch } from "@/lib/queryClient";
import type { LoanItem } from "@shared/schema";
import { LOAN_STATUS } from "@shared/schema";
import { formatDate } from "@/lib/adminUtils";

interface LoanItemDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LoanItem | null;
  onEdit?: (item: LoanItem) => void;
}

export default function LoanItemDetailModal({ 
  open, 
  onOpenChange, 
  item,
  onEdit 
}: LoanItemDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/loan-items/${id}/status`, { status });
    },
    onSuccess: () => {
      invalidateAndRefetch(["/api/admin/loan-items"]);
      invalidateAndRefetch(["/api/loan-items"]);
      toast({
        title: "Statut mis à jour",
        description: "Le statut du matériel a été mis à jour",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/loan-items/${id}`);
    },
    onSuccess: () => {
      invalidateAndRefetch(["/api/admin/loan-items"]);
      invalidateAndRefetch(["/api/loan-items"]);
      toast({
        title: "Matériel supprimé",
        description: "Le matériel a été définitivement supprimé",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de suppression",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      [LOAN_STATUS.AVAILABLE]: "bg-success text-white",
      [LOAN_STATUS.BORROWED]: "bg-warning text-white",
      [LOAN_STATUS.UNAVAILABLE]: "bg-error text-white",
      [LOAN_STATUS.PENDING]: "bg-muted text-muted-foreground",
    };
    return badges[status as keyof typeof badges] || "bg-muted text-muted-foreground";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      [LOAN_STATUS.AVAILABLE]: "Disponible",
      [LOAN_STATUS.BORROWED]: "Emprunté",
      [LOAN_STATUS.UNAVAILABLE]: "Indisponible",
      [LOAN_STATUS.PENDING]: "En attente",
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {item.title}
          </DialogTitle>
          <DialogDescription>
            Détails du matériel proposé au prêt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo */}
          {item.photoUrl ? (
            <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={item.photoUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>
          )}

          <Separator />

          {/* Informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Prêté par
              </h3>
              <p className="text-gray-700">{item.lenderName}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Statut
              </h3>
              <Select
                value={item.status}
                onValueChange={(status) => updateStatusMutation.mutate({ id: item.id, status })}
                disabled={updateStatusMutation.isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <Badge className={getStatusBadge(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LOAN_STATUS.PENDING}>En attente</SelectItem>
                  <SelectItem value={LOAN_STATUS.AVAILABLE}>Disponible</SelectItem>
                  <SelectItem value={LOAN_STATUS.BORROWED}>Emprunté</SelectItem>
                  <SelectItem value={LOAN_STATUS.UNAVAILABLE}>Indisponible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Proposé par</h3>
              <p className="text-gray-700">{item.proposedBy}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact
              </h3>
              <a 
                href={`mailto:${item.proposedByEmail}`}
                className="text-cjd-green hover:underline"
              >
                {item.proposedByEmail}
              </a>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date de création
              </h3>
              <p className="text-gray-700">{formatDate(item.createdAt.toString())}</p>
            </div>

            {item.updatedAt && item.updatedAt !== item.createdAt && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dernière modification
                </h3>
                <p className="text-gray-700">{formatDate(item.updatedAt.toString())}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <Separator />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onEdit && onEdit(item)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce matériel ?")) {
                  deleteMutation.mutate(item.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

