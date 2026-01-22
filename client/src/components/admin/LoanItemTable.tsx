"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import LoanItemTableRow from "./LoanItemTableRow";
import type { LoanItem } from "@shared/schema";

interface LoanItemTableProps {
  loanItems: LoanItem[];
  onViewDetail: (item: LoanItem) => void;
  onStatusChange: (id: string, status: string) => void;
  onEdit: (item: LoanItem) => void;
  onDelete: (id: string) => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
}

export default function LoanItemTable({
  loanItems,
  onViewDetail,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdatingStatus,
  isDeleting,
}: LoanItemTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Photo</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Prêté par</TableHead>
            <TableHead>Proposé par</TableHead>
            <TableHead className="text-center">Statut</TableHead>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loanItems.map((item) => (
            <LoanItemTableRow
              key={item.id}
              item={item}
              onViewDetail={() => onViewDetail(item)}
              onStatusChange={(status) => onStatusChange(item.id, status)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item.id)}
              isUpdatingStatus={isUpdatingStatus}
              isDeleting={isDeleting}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

