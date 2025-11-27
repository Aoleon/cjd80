import { useState } from "react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminIdeasPanel from "@/components/admin/AdminIdeasPanel";
import IdeaDetailModal from "@/components/idea-detail-modal";
import EditIdeaModal from "@/components/edit-idea-modal";
import ManageVotesModal from "@/components/manage-votes-modal";
import FeatureGuard from "@/components/FeatureGuard";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Lightbulb } from "lucide-react";
import { getShortAppName } from '@/config/branding';
import type { IdeaWithVotes } from "@/types/admin";

export default function AdminIdeasPage() {
  const { user, isLoading } = useAuth();
  const [ideaDetailModalOpen, setIdeaDetailModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<IdeaWithVotes | null>(null);
  const [editIdeaModalOpen, setEditIdeaModalOpen] = useState(false);
  const [ideaToEdit, setIdeaToEdit] = useState<IdeaWithVotes | null>(null);
  const [manageVotesModalOpen, setManageVotesModalOpen] = useState(false);
  const [ideaToManageVotes, setIdeaToManageVotes] = useState<IdeaWithVotes | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-cjd-green text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold">{getShortAppName()}</h1>
                <p className="text-white/90">Administration - Boîte à Kiffs</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Veuillez vous connecter pour accéder à l'administration.</p>
        </main>
      </div>
    );
  }

  return (
    <FeatureGuard featureKey="ideas" featureName="La gestion des idées">
      <AdminPageLayout
        title="Gestion des Idées"
        description="Gérer les idées proposées par les membres"
        breadcrumbs={[
          { label: "Contenu", path: "/admin/content" },
          { label: "Idées" },
        ]}
        icon={<Lightbulb className="w-5 h-5 text-cjd-green" />}
        showCard={false}
      >
        <AdminIdeasPanel
          enabled={true}
          onViewDetail={(idea) => { setSelectedIdea(idea); setIdeaDetailModalOpen(true); }}
          onManageVotes={(idea) => { setIdeaToManageVotes(idea); setManageVotesModalOpen(true); }}
          onEdit={(idea) => { setIdeaToEdit(idea); setEditIdeaModalOpen(true); }}
        />
        
        <IdeaDetailModal open={ideaDetailModalOpen} onOpenChange={setIdeaDetailModalOpen} idea={selectedIdea} />
        <EditIdeaModal open={editIdeaModalOpen} onOpenChange={setEditIdeaModalOpen} idea={ideaToEdit} />
        <ManageVotesModal open={manageVotesModalOpen} onOpenChange={setManageVotesModalOpen} idea={ideaToManageVotes} />
      </AdminPageLayout>
    </FeatureGuard>
  );
}

