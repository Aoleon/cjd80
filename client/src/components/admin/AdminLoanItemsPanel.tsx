"use client";

import { Loader2, Package } from "lucide-react";
import { useAdminLoanItems } from "@/hooks/useAdminLoanItems";
import LoanItemTable from "./LoanItemTable";
import LoanItemMobileCard from "./LoanItemMobileCard";
import type { LoanItem } from "@shared/schema";

interface AdminLoanItemsPanelProps {
  enabled: boolean;
  onViewDetail: (item: LoanItem) => void;
  onEdit: (item: LoanItem) => void;
}

export default function AdminLoanItemsPanel({
  enabled,
  onViewDetail,
  onEdit,
}: AdminLoanItemsPanelProps) {
  const {
    loanItems,
    isLoading,
    updateStatus,
    deleteItem,
    isUpdatingStatus,
    isDeleting,
  } = useAdminLoanItems(enabled);

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce matériel ?")) {
      deleteItem.mutate(id);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold">Tous les matériels</h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : loanItems && loanItems.length > 0 ? (
        <>
          <div className="hidden md:block">
            <LoanItemTable
              loanItems={loanItems}
              onViewDetail={onViewDetail}
              onStatusChange={handleStatusChange}
              onEdit={onEdit}
              onDelete={handleDelete}
              isUpdatingStatus={isUpdatingStatus}
              isDeleting={isDeleting}
            />
          </div>

          <div className="md:hidden">
            <LoanItemMobileCard
              loanItems={loanItems}
              onViewDetail={onViewDetail}
              onStatusChange={handleStatusChange}
              onEdit={onEdit}
              onDelete={handleDelete}
              isUpdatingStatus={isUpdatingStatus}
              isDeleting={isDeleting}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun matériel</h3>
          <p className="text-gray-500">Les matériels apparaîtront ici une fois proposés</p>
        </div>
      )}
    </div>
  );
}

