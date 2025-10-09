import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThumbsUp, Lightbulb, Loader2, Vote, Plus, ChevronDown, ChevronUp, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SimplePagination } from "@/components/ui/pagination";
import VoteModal from "./vote-modal";
import type { Idea } from "@shared/schema";
import { IDEA_STATUS } from "@shared/schema";
import { shareContent, isShareSupported } from "@/lib/share-utils";
import { useToast } from "@/hooks/use-toast";
import { branding, getShortAppName } from '@/config/branding';

interface IdeaWithVotes extends Omit<Idea, "voteCount"> {
  voteCount: number;
}

interface PaginatedIdeasResponse {
  success: boolean;
  data: {
    data: IdeaWithVotes[];
    total: number;
    page: number;
    limit: number;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case IDEA_STATUS.APPROVED:
      return 'bg-success-light text-success-dark border-success ring-1 ring-success';
    case IDEA_STATUS.PENDING:
      return 'bg-warning-light text-warning-dark border-warning ring-1 ring-warning';
    case IDEA_STATUS.REJECTED:
      return 'bg-error-light text-error-dark border-error ring-1 ring-error';
    case IDEA_STATUS.UNDER_REVIEW:
      return 'bg-info-light text-info-dark border-info ring-1 ring-info';
    case IDEA_STATUS.POSTPONED:
      return 'bg-slate-50 text-slate-800 border-slate-300 ring-1 ring-slate-200';
    case IDEA_STATUS.COMPLETED:
      return 'bg-success-light text-success-dark border-success ring-1 ring-success';
    default:
      return 'bg-gray-50 text-gray-800 border-gray-300 ring-1 ring-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case IDEA_STATUS.APPROVED:
      return 'Idée soumise au vote';
    case IDEA_STATUS.PENDING:
      return 'En attente';
    case IDEA_STATUS.REJECTED:
      return 'Rejetée';
    case IDEA_STATUS.UNDER_REVIEW:
      return 'En cours d\'étude';
    case IDEA_STATUS.POSTPONED:
      return 'Reportée';
    case IDEA_STATUS.COMPLETED:
      return 'Réalisée';
    default:
      return status;
  }
};

interface IdeasSectionProps {
  onNavigateToPropose?: () => void;
}

export default function IdeasSection({ onNavigateToPropose }: IdeasSectionProps) {
  const [selectedIdea, setSelectedIdea] = useState<IdeaWithVotes | null>(null);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const limit = 20;
  const { toast } = useToast();

  const { data: response, isLoading, error } = useQuery<PaginatedIdeasResponse>({
    queryKey: ["/api/ideas", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/ideas?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch ideas');
      return res.json();
    }
  });

  const ideas = response?.data?.data || [];
  const total = response?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error">Erreur lors du chargement des idées</p>
      </div>
    );
  }

  const handleVoteClick = (idea: IdeaWithVotes) => {
    setSelectedIdea(idea);
    setVoteModalOpen(true);
  };

  const handleShare = async (idea: IdeaWithVotes) => {
    const result = await shareContent({
      title: idea.title,
      text: idea.description || idea.title,
      url: window.location.origin
    });

    if (result.success) {
      if (isShareSupported()) {
        toast({
          title: "✅ Partagé avec succès !",
          description: "L'idée a été partagée.",
        });
      } else {
        toast({
          title: "📋 Lien copié dans le presse-papiers",
          description: "Vous pouvez maintenant partager ce lien.",
        });
      }
    } else if (result.reason === 'cancelled') {
      toast({
        title: "ℹ️ Partage annulé",
        variant: "default",
      });
    } else if (result.reason === 'error') {
      toast({
        title: "❌ Impossible de partager",
        description: result.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Welcome Message */}
      <div className="flex flex-col items-center text-center mb-6">
        <img 
          src={branding.assets.boiteKiffImage} 
          alt="La Boîte à Kiffs" 
          className="h-36 sm:h-48 w-auto object-contain rounded-[60px] mb-4"
          style={{ transform: 'scale(1)' }}
        />
        <p className="text-sm sm:text-base text-gray-600 text-center max-w-2xl">
          Découvrez les idées proposées par la section et votez pour celles que vous souhaitez voir réalisées
        </p>
      </div>

      {/* Ideas Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : ideas && ideas.length > 0 ? (
        <div className="grid gap-5 sm:gap-7 md:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea) => (
            <Card key={idea.id} className="bg-white border-2 border-gray-100 hover:border-cjd-green/30 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 line-clamp-3 lg:flex-1 leading-tight order-1">
                    <div className="flex items-start gap-2">
                      {idea.featured && (
                        <div title="Idée mise en avant">
                          <Star className="w-5 h-5 text-warning fill-current flex-shrink-0 mt-0.5" />
                        </div>
                      )}
                      <span className="break-words">{idea.title}</span>
                    </div>
                  </h3>
                  <div className="flex items-center gap-2 order-2 lg:order-2 flex-wrap sm:flex-nowrap">
                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap shadow-sm ${getStatusColor(idea.status)}`}>
                      {getStatusLabel(idea.status)}
                    </span>
                    {idea.status !== IDEA_STATUS.COMPLETED && (
                      <Button
                        onClick={() => handleVoteClick(idea)}
                        className="bg-gradient-to-r from-cjd-green to-success-dark text-white hover:from-success-dark hover:to-cjd-green shadow-md hover:shadow-lg transition-all duration-200 text-xs font-semibold transform hover:scale-105 flex-shrink-0"
                        size="sm"
                      >
                        <Vote className="w-3 h-3 mr-1" />
                        Voter
                      </Button>
                    )}
                    <Button
                      onClick={() => handleShare(idea)}
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 flex-shrink-0 h-8 w-8 p-0"
                      data-testid={`button-share-idea-${idea.id}`}
                      title="Partager cette idée"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {idea.description && (
                  <div className="mb-5">
                    <p className={`text-gray-700 text-sm sm:text-base leading-relaxed ${
                      !expandedDescriptions.has(idea.id) && idea.description.length > 200 ? 'line-clamp-3' : ''
                    }`}>
                      {idea.description}
                    </p>
                    {idea.description.length > 200 && (
                      <button
                        onClick={() => {
                          const newSet = new Set(expandedDescriptions);
                          if (newSet.has(idea.id)) {
                            newSet.delete(idea.id);
                          } else {
                            newSet.add(idea.id);
                          }
                          setExpandedDescriptions(newSet);
                        }}
                        className="text-cjd-green hover:text-success-dark text-sm font-medium mt-2 flex items-center"
                      >
                        {expandedDescriptions.has(idea.id) ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Voir moins
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Voir plus
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
                <div className="border-t border-gray-100 pt-4">
                  {/* Section votes - masquée pour les idées réalisées */}
                  {idea.status !== IDEA_STATUS.COMPLETED && (
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="bg-cjd-green/10 p-1.5 rounded-full">
                          <ThumbsUp className="w-4 h-4 text-cjd-green flex-shrink-0" />
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">
                          {idea.voteCount} vote{idea.voteCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="font-medium">Proposée par</span> {idea.proposedBy}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucune idée pour le moment</h3>
          <p className="text-gray-500">Soyez le premier à proposer une idée !</p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && ideas && ideas.length > 0 && totalPages > 1 && (
        <SimplePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          onPageChange={setPage}
        />
      )}

      {/* Add Idea Section */}
      <div className="bg-gradient-to-r from-cjd-green to-success-dark rounded-lg shadow-md p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold mb-2 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Vous avez une idée ?
            </h3>
            <p className="text-sm sm:text-base text-white opacity-90">
              Partagez votre idée avec la communauté {getShortAppName()} et permettez aux autres de voter pour la soutenir
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              onClick={onNavigateToPropose}
              className="bg-white text-cjd-green hover:bg-gray-100 transition-colors duration-200 w-full sm:w-auto font-medium"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une idée
            </Button>
          </div>
        </div>
      </div>

      <VoteModal
        open={voteModalOpen}
        onOpenChange={setVoteModalOpen}
        idea={selectedIdea}
      />
    </section>
  );
}
