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

  const remainingChars = 5000 - (formData.description?.length || 0);

  return (
    <section className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-cjd-green/10 p-4 rounded-full">
            <Lightbulb className="h-10 w-10 text-cjd-green" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Proposer une nouvelle idée</h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Partagez vos idées innovantes avec la communauté CJD Amiens. 
          Votre proposition sera visible immédiatement et pourra recevoir les votes des membres.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="idea-title" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-cjd-green" />
                Titre de l'idée *
              </Label>
              <Input
                id="idea-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Décrivez votre idée en quelques mots..."
                required
                className="h-12 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cjd-green/20 focus:border-cjd-green transition-all duration-200 hover:border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idea-description" className="text-base font-semibold text-gray-800">
                Description détaillée
              </Label>
              <Textarea
                id="idea-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Expliquez votre idée : objectifs, bénéfices, mise en œuvre..."
                rows={5}
                maxLength={5000}
                className="text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cjd-green/20 focus:border-cjd-green transition-all duration-200 hover:border-gray-300 resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Une description détaillée aide les autres à comprendre votre projet (max 5000 caractères)
                </p>
                <p className={`text-sm font-medium ${remainingChars < 200 ? 'text-orange-600' : 'text-gray-500'}`}>
                  {remainingChars} caractères restants
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Vos informations</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="proposer-name" className="text-base font-medium text-gray-700">
                    Votre nom *
                  </Label>
                  <Input
                    id="proposer-name"
                    type="text"
                    value={formData.proposedBy}
                    onChange={(e) => handleInputChange("proposedBy", e.target.value)}
                    placeholder="Prénom Nom"
                    required
                    className="h-11 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cjd-green/20 focus:border-cjd-green transition-all duration-200 hover:border-gray-300 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposer-email" className="text-base font-medium text-gray-700">
                    Votre email *
                  </Label>
                  <Input
                    id="proposer-email"
                    type="email"
                    value={formData.proposedByEmail}
                    onChange={(e) => handleInputChange("proposedByEmail", e.target.value)}
                    placeholder="votre.email@exemple.com"
                    required
                    className="h-11 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cjd-green/20 focus:border-cjd-green transition-all duration-200 hover:border-gray-300 bg-white"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Ces informations resteront privées et ne seront utilisées que pour vous contacter si nécessaire.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={createIdeaMutation.isPending}
                className="bg-gradient-to-r from-cjd-green to-green-600 text-white hover:from-green-600 hover:to-cjd-green shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-12 px-8 text-base font-semibold rounded-xl"
              >
                {createIdeaMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Proposer mon idée
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
    </section>
  );
}
