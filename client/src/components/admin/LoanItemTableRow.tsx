"use client";

import { Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOAN_STATUS } from "@shared/schema";
import { formatDate } from "@/lib/adminUtils";
import type { LoanItem } from "@shared/schema";

interface LoanItemTableRowProps {
  item: LoanItem;
  onViewDetail: () => void;
  onStatusChange: (status: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
}

export default function LoanItemTableRow({
  item,
  onViewDetail,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdatingStatus,
  isDeleting,
}: LoanItemTableRowProps) {
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

  return (
    <TableRow>
      <TableCell>
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={item.title}
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium max-w-xs">
        <button
          onClick={onViewDetail}
          className="font-semibold text-left hover:text-cjd-green transition-colors cursor-pointer text-info hover:underline"
        >
          {item.title}
        </button>
        {item.description && (
          <div className="text-sm text-gray-500 truncate mt-1">
            {item.description}
          </div>
        )}
      </TableCell>
      <TableCell>{item.lenderName}</TableCell>
      <TableCell>
        <div>
          <div className="text-sm font-medium">{item.proposedBy}</div>
          <div className="text-xs text-gray-500">{item.proposedByEmail}</div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Select
          value={item.status}
          onValueChange={onStatusChange}
          disabled={isUpdatingStatus}
        >
          <SelectTrigger className="w-36">
            <SelectValue>
              <div className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(item.status)}`}>
                {getStatusLabel(item.status)}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LOAN_STATUS.PENDING}>En attente</SelectItem>
            <SelectItem value={LOAN_STATUS.AVAILABLE}>Disponible</SelectItem>
            <SelectItem value={LOAN_STATUS.BORROWED}>Emprunté</SelectItem>
            <SelectItem value={LOAN_STATUS.UNAVAILABLE}>Indisponible</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-center">
        {formatDate(item.createdAt.toString())}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="text-info hover:text-info-dark hover:bg-info-light"
            title="Modifier ce matériel"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-error hover:text-error-dark hover:bg-error-light"
            title="Supprimer ce matériel"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

