import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Lightbulb, Calendar, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertIdeaSchema, type InsertIdea } from "@shared/schema";

// Form schema with client-side validation matching server schema
const proposeIdeaFormSchema = insertIdeaSchema.extend({
  deadline: insertIdeaSchema.shape.deadline.optional(),
});

type ProposeIdeaForm = InsertIdea & {
  deadline?: string;
};

export default function ProposePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<ProposeIdeaForm>({
    resolver: zodResolver(proposeIdeaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      proposedBy: "",
      proposedByEmail: "",
      deadline: undefined,
    },
  });

  const proposeIdeaMutation = useMutation({
    mutationFn: async (data: ProposeIdeaForm) => {
      const res = await apiRequest("POST", "/api/ideas", data);
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Erreur lors de la proposition d'idée");
      }
      return await res.json();
    },
    onSuccess: (idea) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      
      toast({
        title: "✅ Idée proposée avec succès !",
        description: `"${idea.title}" a été ajoutée à la Boîte à Kiffs`,
        duration: 5000,
      });
      
      // Reset form and redirect to ideas
      form.reset();
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erreur lors de la proposition",
        description: error.message,
        variant: "destructive",
        duration: 8000,
      });
    },
  });

  const onSubmit = (data: ProposeIdeaForm) => {
    // Convert deadline to ISO string if provided
    const formattedData = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
    };
    proposeIdeaMutation.mutate(formattedData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-cjd-green/10 p-3 rounded-full">
            <Lightbulb className="h-8 w-8 text-cjd-green" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Proposer une idée</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Partagez vos idées avec la section CJD Amiens. Votre proposition sera immédiatement visible 
          et pourra recevoir les votes des autres membres.
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-cjd-green" />
            Nouvelle idée
          </CardTitle>
          <CardDescription>
            Complétez les informations ci-dessous pour proposer votre idée à la communauté
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Titre de l'idée *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Organisation d'un afterwork tech"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      Un titre court et explicite (3-200 caractères)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Description détaillée
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez votre idée, ses bénéfices, comment la mettre en œuvre..."
                        className="min-h-32 text-base"
                        maxLength={5000}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Expliquez votre idée en détail (max 5000 caractères)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Proposed By Field */}
              <FormField
                control={form.control}
                name="proposedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Votre nom *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Jean Dupont"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      Votre nom apparaîtra comme porteur de l'idée
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="proposedByEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Votre email *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jean.dupont@exemple.com"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      Pour vous contacter en cas de suivi de l'idée
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Optional Deadline Field */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Échéance souhaitée (optionnel)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Si votre idée a une contrainte de temps
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={proposeIdeaMutation.isPending}
                  className="bg-cjd-green hover:bg-green-700 text-white flex-1"
                  size="lg"
                >
                  {proposeIdeaMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Proposer cette idée
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="px-8"
                  size="lg"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <h3 className="font-medium text-blue-800 mb-2">💡 Conseils pour une bonne idée</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Soyez clair et concis dans le titre</li>
          <li>• Expliquez les bénéfices pour la section</li>
          <li>• Mentionnez la faisabilité si c'est pertinent</li>
          <li>• N'hésitez pas à proposer votre aide pour la réalisation</li>
        </ul>
      </div>
    </div>
  );
}