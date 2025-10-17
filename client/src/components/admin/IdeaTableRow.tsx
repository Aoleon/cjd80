import { Edit, Trash2, Users, Star, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IDEA_STATUS } from "@shared/schema";
import { formatDate, getIdeaStatusInfo, isNewIdea } from "@/lib/adminUtils";
import type { IdeaWithVotes } from "@/types/admin";

interface IdeaTableRowProps {
  idea: IdeaWithVotes;
  onViewDetail: () => void;
  onStatusChange: (status: string) => void;
  onManageVotes: () => void;
  onToggleFeatured: () => void;
  onEdit: () => void;
  onTransformToEvent: () => void;
  onDelete: () => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  isTogglingFeatured: boolean;
  isTransforming: boolean;
}

export default function IdeaTableRow({
  idea,
  onViewDetail,
  onStatusChange,
  onManageVotes,
  onToggleFeatured,
  onEdit,
  onTransformToEvent,
  onDelete,
  isUpdatingStatus,
  isDeleting,
  isTogglingFeatured,
  isTransforming,
}: IdeaTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium max-w-xs">
        <div>
          <button
            onClick={onViewDetail}
            className="font-semibold text-left hover:text-cjd-green transition-colors cursor-pointer text-info hover:underline"
            data-testid={`button-view-idea-${idea.id}`}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              {idea.featured && (
                <Star className="w-4 h-4 text-warning fill-current flex-shrink-0" />
              )}
              <span>{idea.title}</span>
              {isNewIdea(idea.createdAt) && (
                <span className="bg-success text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
                  Nouveau
                </span>
              )}
            </div>
          </button>
          {idea.description && (
            <div className="text-sm text-gray-500 truncate">
              {idea.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>{idea.proposedBy}</TableCell>
      <TableCell className="text-center">
        <Select
          value={idea.status}
          onValueChange={onStatusChange}
          disabled={isUpdatingStatus}
        >
          <SelectTrigger className="w-36">
            <SelectValue>
              <div className={`inline-block px-2 py-1 text-xs rounded-full ${getIdeaStatusInfo(idea.status).class}`}>
                {getIdeaStatusInfo(idea.status).label}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={IDEA_STATUS.PENDING}>En attente</SelectItem>
            <SelectItem value={IDEA_STATUS.APPROVED}>Idée soumise au vote</SelectItem>
            <SelectItem value={IDEA_STATUS.REJECTED}>Rejetée</SelectItem>
            <SelectItem value={IDEA_STATUS.UNDER_REVIEW}>En cours d'étude</SelectItem>
            <SelectItem value={IDEA_STATUS.POSTPONED}>Reportée</SelectItem>
            <SelectItem value={IDEA_STATUS.COMPLETED}>Réalisée</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={onManageVotes}
          className="text-info hover:text-info-dark hover:bg-info-light"
          title="Gérer les votes"
          data-testid={`button-manage-votes-${idea.id}`}
        >
          <Users className="w-4 h-4 mr-1" />
          {idea.voteCount}
        </Button>
      </TableCell>
      <TableCell className="text-center">
        {formatDate(idea.createdAt.toString())}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleFeatured}
            disabled={isTogglingFeatured}
            className={idea.featured ? "text-warning hover:text-warning-dark hover:bg-warning-light" : "text-gray-400 hover:text-warning hover:bg-warning-light"}
            title={idea.featured ? "Retirer la mise en avant" : "Mettre en avant cette idée"}
            data-testid={`button-toggle-featured-${idea.id}`}
          >
            <Star className={`w-4 h-4 ${idea.featured ? "fill-current" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="text-info hover:text-info-dark hover:bg-info-light"
            title="Modifier cette idée"
            data-testid={`button-edit-${idea.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          {(idea.status === IDEA_STATUS.APPROVED || idea.status === IDEA_STATUS.COMPLETED) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onTransformToEvent}
              disabled={isTransforming}
              className="text-success hover:text-success-dark hover:bg-success-light"
              title="Transformer cette idée en événement"
              data-testid={`button-transform-${idea.id}`}
            >
              <CalendarPlus className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-error hover:text-error-dark hover:bg-error-light"
            title="Supprimer cette idée"
            data-testid={`button-delete-${idea.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
