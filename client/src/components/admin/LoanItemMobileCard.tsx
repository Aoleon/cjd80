import { Edit, Trash2, Image as ImageIcon, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface LoanItemMobileCardProps {
  loanItems: LoanItem[];
  onViewDetail: (item: LoanItem) => void;
  onStatusChange: (id: string, status: string) => void;
  onEdit: (item: LoanItem) => void;
  onDelete: (id: string) => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
}

export default function LoanItemMobileCard({
  loanItems,
  onViewDetail,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdatingStatus,
  isDeleting,
}: LoanItemMobileCardProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      [LOAN_STATUS.AVAILABLE]: "bg-success text-white",
      [LOAN_STATUS.BORROWED]: "bg-warning text-white",
      [LOAN_STATUS.UNAVAILABLE]: "bg-error text-white",
      [LOAN_STATUS.PENDING]: "bg-gray-400 text-white",
    };
    return badges[status as keyof typeof badges] || "bg-gray-400 text-white";
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
    <div className="space-y-4">
      {loanItems.map((item) => (
        <Card key={item.id} className="bg-white">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Photo */}
              <div className="flex-shrink-0">
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => onViewDetail(item)}
                  className="font-semibold text-lg text-left hover:text-cjd-green transition-colors cursor-pointer mb-2 block"
                >
                  {item.title}
                </button>

                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div>
                    <strong>Prêté par:</strong> {item.lenderName}
                  </div>
                  <div>
                    <strong>Proposé par:</strong> {item.proposedBy}
                  </div>
                  {item.description && (
                    <div className="text-gray-500 line-clamp-2">
                      {item.description}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Select
                    value={item.status}
                    onValueChange={(status) => onStatusChange(item.id, status)}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOAN_STATUS.PENDING}>En attente</SelectItem>
                      <SelectItem value={LOAN_STATUS.AVAILABLE}>Disponible</SelectItem>
                      <SelectItem value={LOAN_STATUS.BORROWED}>Emprunté</SelectItem>
                      <SelectItem value={LOAN_STATUS.UNAVAILABLE}>Indisponible</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.createdAt.toString())}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(item.id)}
                    disabled={isDeleting}
                    className="flex-1 text-error border-error hover:bg-error-light"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

