"use client";

import { Edit, Trash2, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface IdeaMobileCardItemProps {
  idea: IdeaWithVotes;
  onViewDetail: () => void;
  onStatusChange: (status: string) => void;
  onManageVotes: () => void;
  onToggleFeatured: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  isTogglingFeatured: boolean;
}

export default function IdeaMobileCardItem({
  idea,
  onViewDetail,
  onStatusChange,
  onManageVotes,
  onToggleFeatured,
  onEdit,
  onDelete,
  isUpdatingStatus,
  isDeleting,
  isTogglingFeatured,
}: IdeaMobileCardItemProps) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-3">
          <button
            onClick={onViewDetail}
            className="flex-1 text-left"
            data-testid={`button-view-idea-mobile-${idea.id}`}
          >
            <h4 className="font-semibold text-info hover:text-cjd-green transition-colors hover:underline flex items-center gap-1.5 flex-wrap">
              {idea.featured && (
                <Star className="w-4 h-4 text-warning fill-current flex-shrink-0" />
              )}
              <span>{idea.title}</span>
              {isNewIdea(idea.createdAt) && (
                <span className="bg-success text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
                  Nouveau
                </span>
              )}
            </h4>
            {idea.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {idea.description}
              </p>
            )}
          </button>
          <div className={`px-2 py-1 text-xs rounded-full ${getIdeaStatusInfo(idea.status).class} whitespace-nowrap`}>
            {getIdeaStatusInfo(idea.status).label}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div>
            <span className="font-medium">Auteur:</span>
            <div className="truncate">{idea.proposedBy}</div>
          </div>
          <div>
            <span className="font-medium">Votants:</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onManageVotes}
              className="text-info hover:text-info-dark hover:bg-info-light p-1"
              title="Gérer les votes"
              data-testid={`button-manage-votes-mobile-${idea.id}`}
            >
              <Users className="w-3 h-3 mr-1" />
              {idea.voteCount}
            </Button>
          </div>
          <div className="col-span-2">
            <span className="font-medium">Date:</span>
            <div>{formatDate(idea.createdAt.toString())}</div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Changer le statut
            </label>
            <Select
              value={idea.status}
              onValueChange={onStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="w-full">
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
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleFeatured}
              disabled={isTogglingFeatured}
              className={`flex-1 ${idea.featured ? "text-warning border-warning hover:bg-warning-light" : "text-gray-600 border-gray-300 hover:bg-gray-50"}`}
              data-testid={`button-toggle-featured-mobile-${idea.id}`}
            >
              <Star className={`w-4 h-4 mr-2 ${idea.featured ? "fill-current" : ""}`} />
              {idea.featured ? "Retirer mise en avant" : "Mettre en avant"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="flex-1 text-info border-info hover:bg-info-light"
              data-testid={`button-edit-mobile-${idea.id}`}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              disabled={isDeleting}
              className="flex-1 text-error border-error hover:bg-error-light"
              data-testid={`button-delete-mobile-${idea.id}`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
