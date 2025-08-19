import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertIdea } from "@shared/schema";

export default function ProposeSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    proposedBy: "",
    proposedByEmail: "",
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (idea: InsertIdea) => {
      const res = await apiRequest("POST", "/api/ideas", idea);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      setFormData({ title: "", description: "", proposedBy: "", proposedByEmail: "" });
      toast({
        title: "Idée soumise avec succès !",
        description: "Votre idée a été ajoutée à la boîte à kiffs",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre l'idée. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createIdeaMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const remainingChars = 500 - (formData.description?.length || 0);

  return (
    <section className="space-y-6 sm:space-y-8">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl text-gray-800">Proposer une nouvelle idée</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="idea-title" className="text-sm font-medium text-gray-700">
                Titre de l'idée *
              </Label>
              <Input
                id="idea-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Un titre court et explicite"
                required
                className="focus:ring-cjd-green focus:border-cjd-green"
              />
            </div>

            <div>
              <Label htmlFor="idea-description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="idea-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Décrivez votre idée, ses bénéfices..."
                rows={4}
                maxLength={500}
                className="focus:ring-cjd-green focus:border-cjd-green"
              />
              <p className="text-xs text-gray-500 mt-1">
                {remainingChars} caractères restants
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="proposer-name" className="text-sm font-medium text-gray-700">
                  Votre nom *
                </Label>
                <Input
                  id="proposer-name"
                  type="text"
                  value={formData.proposedBy}
                  onChange={(e) => handleInputChange("proposedBy", e.target.value)}
                  placeholder="Prénom Nom"
                  required
                  className="focus:ring-cjd-green focus:border-cjd-green"
                />
              </div>
              <div>
                <Label htmlFor="proposer-email" className="text-sm font-medium text-gray-700">
                  Votre email *
                </Label>
                <Input
                  id="proposer-email"
                  type="email"
                  value={formData.proposedByEmail}
                  onChange={(e) => handleInputChange("proposedByEmail", e.target.value)}
                  placeholder="email@exemple.com"
                  required
                  className="focus:ring-cjd-green focus:border-cjd-green"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button
                type="submit"
                disabled={createIdeaMutation.isPending}
                className="bg-cjd-green text-white hover:bg-cjd-green-dark transition-colors duration-200 w-full sm:w-auto"
              >
                {createIdeaMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4 mr-2" />
                )}
                Proposer l'idée
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
