import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThumbsUp, Lightbulb, Loader2, Vote, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VoteModal from "./vote-modal";
import type { Idea } from "@shared/schema";
import boiteKiffImage from "@assets/boite-kiff_1755640123881.jpeg";

interface IdeaWithVotes extends Omit<Idea, "voteCount"> {
  voteCount: number;
}

interface IdeasSectionProps {
  onNavigateToPropose?: () => void;
}

export default function IdeasSection({ onNavigateToPropose }: IdeasSectionProps) {
  const [selectedIdea, setSelectedIdea] = useState<IdeaWithVotes | null>(null);
  const [voteModalOpen, setVoteModalOpen] = useState(false);

  const { data: ideas, isLoading, error } = useQuery<IdeaWithVotes[]>({
    queryKey: ["/api/ideas"],
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erreur lors du chargement des idées</p>
      </div>
    );
  }

  const handleVoteClick = (idea: IdeaWithVotes) => {
    setSelectedIdea(idea);
    setVoteModalOpen(true);
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-cjd-green">
        <div className="flex items-center gap-4 mb-2">
          <img 
            src={boiteKiffImage} 
            alt="La Boîte à Kiffs" 
            className="h-12 sm:h-16 w-auto object-contain"
          />
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Découvrez les idées proposées par la section et votez pour celles que vous souhaitez voir réalisées
        </p>
      </div>

      {/* Ideas Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : ideas && ideas.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-2 line-clamp-2">{idea.title}</h3>
                {idea.description && (
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3">{idea.description}</p>
                )}
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-2">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="w-4 h-4 text-cjd-green flex-shrink-0" />
                    <span className="font-medium text-gray-700 text-sm">
                      {idea.voteCount} vote{idea.voteCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleVoteClick(idea)}
                    className="bg-cjd-green text-white hover:bg-cjd-green-dark transition-colors duration-200 text-xs sm:text-sm w-full xs:w-auto"
                    size="sm"
                  >
                    <Vote className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Voter
                  </Button>
                </div>
                <div className="mt-3 sm:mt-4 text-xs text-gray-500">
                  Proposée par {idea.proposedBy}
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

      {/* Add Idea Section */}
      <div className="bg-gradient-to-r from-cjd-green to-green-600 rounded-lg shadow-md p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold mb-2 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Vous avez une idée ?
            </h3>
            <p className="text-sm sm:text-base text-green-100 opacity-90">
              Partagez votre idée avec la communauté CJD Amiens et permettez aux autres de voter pour la soutenir
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
