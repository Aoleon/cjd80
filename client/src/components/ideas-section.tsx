import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThumbsUp, Lightbulb, Loader2, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VoteModal from "./vote-modal";
import type { Idea } from "@shared/schema";

interface IdeaWithVotes extends Omit<Idea, "voteCount"> {
  voteCount: number;
}

export default function IdeasSection() {
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
    <section className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-cjd-green">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Boîte à Kiffs</h2>
        <p className="text-gray-600">
          Découvrez les idées proposées par la section et votez pour celles que vous souhaitez voir réalisées
        </p>
      </div>

      {/* Ideas Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : ideas && ideas.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{idea.title}</h3>
                {idea.description && (
                  <p className="text-gray-600 text-sm mb-4">{idea.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="w-4 h-4 text-cjd-green" />
                    <span className="font-medium text-gray-700">
                      {idea.voteCount} vote{idea.voteCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleVoteClick(idea)}
                    className="bg-cjd-green text-white hover:bg-cjd-green-dark transition-colors duration-200 text-sm"
                    size="sm"
                  >
                    <Vote className="w-4 h-4 mr-1" />
                    Voter
                  </Button>
                </div>
                <div className="mt-4 text-xs text-gray-500">
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

      <VoteModal
        open={voteModalOpen}
        onOpenChange={setVoteModalOpen}
        idea={selectedIdea}
      />
    </section>
  );
}
