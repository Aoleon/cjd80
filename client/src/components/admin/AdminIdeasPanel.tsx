import { Loader2, Lightbulb } from "lucide-react";
import { useAdminIdeas } from "@/hooks/useAdminIdeas";
import IdeaTable from "./IdeaTable";
import IdeaMobileCard from "./IdeaMobileCard";
import { ExportButton } from "@/components/ui/export-button";
import type { IdeaWithVotes } from "@/types/admin";
import type { ExportColumn } from "@/lib/export-utils";

interface AdminIdeasPanelProps {
  enabled: boolean;
  onViewDetail: (idea: IdeaWithVotes) => void;
  onManageVotes: (idea: IdeaWithVotes) => void;
  onEdit: (idea: IdeaWithVotes) => void;
}

// Colonnes pour l'export
const exportColumns: ExportColumn[] = [
  { header: 'Titre', accessor: 'title' },
  { header: 'Description', accessor: 'description', format: (v) => v || '' },
  { header: 'Proposé par', accessor: 'proposedBy' },
  { header: 'Email', accessor: 'proposedByEmail' },
  { header: 'Statut', accessor: 'status' },
  { header: 'Votes', accessor: 'voteCount', format: (v) => String(v) },
  { header: 'Mis en avant', accessor: 'featured', format: (v) => v ? 'Oui' : 'Non' },
  { header: 'Date création', accessor: 'createdAt', format: (v) => v ? new Date(v).toLocaleDateString('fr-FR') : '' },
];

export default function AdminIdeasPanel({
  enabled,
  onViewDetail,
  onManageVotes,
  onEdit,
}: AdminIdeasPanelProps) {
  const {
    ideas,
    isLoading,
    updateStatus,
    toggleFeatured,
    deleteIdea,
    convertToEvent,
    isUpdatingStatus,
    isDeleting,
    isTogglingFeatured,
    isConverting,
  } = useAdminIdeas(enabled);

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette idée ?")) {
      deleteIdea(id);
    }
  };

  const handleTransform = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir transformer cette idée en événement ? Cette action créera un nouvel événement basé sur cette idée.")) {
      convertToEvent(id);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatus({ id, status });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold">Toutes les idées</h3>
        {ideas && ideas.length > 0 && (
          <ExportButton
            filename="idees-cjd"
            title="Liste des Idées CJD"
            columns={exportColumns}
            getData={() => ideas || []}
            size="sm"
          />
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : ideas && ideas.length > 0 ? (
        <>
          <div className="hidden md:block">
            <IdeaTable
              ideas={ideas}
              onViewDetail={onViewDetail}
              onStatusChange={handleStatusChange}
              onManageVotes={onManageVotes}
              onToggleFeatured={toggleFeatured}
              onEdit={onEdit}
              onTransformToEvent={handleTransform}
              onDelete={handleDelete}
              isUpdatingStatus={isUpdatingStatus}
              isDeleting={isDeleting}
              isTogglingFeatured={isTogglingFeatured}
              isTransforming={isConverting}
            />
          </div>

          <div className="md:hidden">
            <IdeaMobileCard
              ideas={ideas}
              onViewDetail={onViewDetail}
              onStatusChange={handleStatusChange}
              onManageVotes={onManageVotes}
              onToggleFeatured={toggleFeatured}
              onEdit={onEdit}
              onDelete={handleDelete}
              isUpdatingStatus={isUpdatingStatus}
              isDeleting={isDeleting}
              isTogglingFeatured={isTogglingFeatured}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune idée</h3>
          <p className="text-gray-500">Les idées apparaîtront ici une fois proposées</p>
        </div>
      )}
    </div>
  );
}
