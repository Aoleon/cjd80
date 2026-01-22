"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import IdeaTableRow from "./IdeaTableRow";
import type { IdeaWithVotes } from "@/types/admin";

interface IdeaTableProps {
  ideas: IdeaWithVotes[];
  onViewDetail: (idea: IdeaWithVotes) => void;
  onStatusChange: (id: string, status: string) => void;
  onManageVotes: (idea: IdeaWithVotes) => void;
  onToggleFeatured: (id: string) => void;
  onEdit: (idea: IdeaWithVotes) => void;
  onTransformToEvent: (id: string) => void;
  onDelete: (id: string) => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  isTogglingFeatured: boolean;
  isTransforming: boolean;
}

export default function IdeaTable({
  ideas,
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
}: IdeaTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Auteur</TableHead>
            <TableHead className="text-center">Statut</TableHead>
            <TableHead className="text-center">Votants</TableHead>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas.map((idea) => (
            <IdeaTableRow
              key={idea.id}
              idea={idea}
              onViewDetail={() => onViewDetail(idea)}
              onStatusChange={(status) => onStatusChange(idea.id, status)}
              onManageVotes={() => onManageVotes(idea)}
              onToggleFeatured={() => onToggleFeatured(idea.id)}
              onEdit={() => onEdit(idea)}
              onTransformToEvent={() => onTransformToEvent(idea.id)}
              onDelete={() => onDelete(idea.id)}
              isUpdatingStatus={isUpdatingStatus}
              isDeleting={isDeleting}
              isTogglingFeatured={isTogglingFeatured}
              isTransforming={isTransforming}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
