import IdeaMobileCardItem from "./IdeaMobileCardItem";
import type { IdeaWithVotes } from "@/types/admin";

interface IdeaMobileCardProps {
  ideas: IdeaWithVotes[];
  onViewDetail: (idea: IdeaWithVotes) => void;
  onStatusChange: (id: string, status: string) => void;
  onManageVotes: (idea: IdeaWithVotes) => void;
  onToggleFeatured: (id: string) => void;
  onEdit: (idea: IdeaWithVotes) => void;
  onDelete: (id: string) => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  isTogglingFeatured: boolean;
}

export default function IdeaMobileCard({
  ideas,
  onViewDetail,
  onStatusChange,
  onManageVotes,
  onToggleFeatured,
  onEdit,
  onDelete,
  isUpdatingStatus,
  isDeleting,
  isTogglingFeatured,
}: IdeaMobileCardProps) {
  return (
    <div className="space-y-4">
      {ideas.map((idea) => (
        <IdeaMobileCardItem
          key={idea.id}
          idea={idea}
          onViewDetail={() => onViewDetail(idea)}
          onStatusChange={(status) => onStatusChange(idea.id, status)}
          onManageVotes={() => onManageVotes(idea)}
          onToggleFeatured={() => onToggleFeatured(idea.id)}
          onEdit={() => onEdit(idea)}
          onDelete={() => onDelete(idea.id)}
          isUpdatingStatus={isUpdatingStatus}
          isDeleting={isDeleting}
          isTogglingFeatured={isTogglingFeatured}
        />
      ))}
    </div>
  );
}
