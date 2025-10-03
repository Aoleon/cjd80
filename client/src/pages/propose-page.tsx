import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Lightbulb, Calendar, Send, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { insertIdeaSchema, insertPatronSchema, type InsertIdea, type InsertPatron, type Patron } from "@shared/schema";

// Form schema with client-side validation matching server schema
const proposeIdeaFormSchema = insertIdeaSchema.extend({
  deadline: insertIdeaSchema.shape.deadline.optional(),
});

type ProposeIdeaForm = InsertIdea & {
  deadline?: string;
};

// Form schema for patron creation with required fields
const patronFormSchema = insertPatronSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  company: true,
  phone: true,
  role: true,
});

type PatronForm = {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  role?: string;
};

export default function ProposePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Patron-related state
  const [selectedPatronId, setSelectedPatronId] = useState<string | null>(null);
  const [isPatronDialogOpen, setIsPatronDialogOpen] = useState(false);

  const form = useForm<ProposeIdeaForm>({
    resolver: zodResolver(proposeIdeaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      proposedBy: "",
      proposedByEmail: "",
      company: "",
      deadline: undefined,
    },
  });

  // Separate form for patron creation
  const patronForm = useForm<PatronForm>({
    resolver: zodResolver(patronFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
      role: "",
    },
  });

  // Check if user is admin (has admin.manage permission)
  const isAdmin = user?.role === "super_admin" || user?.role === "ideas_manager";

  // Query to fetch patrons (only enabled for admin users)
  const { data: patrons = [], isLoading: isLoadingPatrons } = useQuery<Patron[]>({
    queryKey: ["/api/patrons"],
    enabled: isAdmin,
  });

  // Mutation to create a new patron
  const createPatronMutation = useMutation({
    mutationFn: async (patronData: PatronForm) => {
      const dataWithCreatedBy = {
        ...patronData,
        createdBy: user?.email,
      };
      const res = await apiRequest("POST", "/api/patrons", dataWithCreatedBy);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Erreur création mécène");
      }
      return await res.json();
    },
    onSuccess: (newPatron: Patron) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patrons"] });
      setSelectedPatronId(newPatron.id);
      setIsPatronDialogOpen(false);
      patronForm.reset();
      toast({
        title: "Mécène créé",
        description: `${newPatron.firstName} ${newPatron.lastName} a été ajouté`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
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
    onSuccess: async (idea) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      
      // Si un mécène est sélectionné, créer la proposition
      if (selectedPatronId && isAdmin) {
        try {
          const res = await apiRequest("POST", `/api/ideas/${idea.id}/patrons`, {
            patronId: selectedPatronId,
            status: 'proposed',
          });
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Erreur de liaison");
          }
          toast({
            title: "✅ Idée et mécène liés !",
            description: `Idée proposée et mécène associé avec succès`,
          });
        } catch (err) {
          console.error("Erreur création proposition:", err);
          toast({
            title: "⚠️ Idée créée, mais erreur de liaison",
            description: err instanceof Error ? err.message : "L'idée a été créée mais le mécène n'a pas pu être associé",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "✅ Idée proposée avec succès !",
          description: `"${idea.title}" a été ajoutée à la Boîte à Kiffs`,
          duration: 5000,
        });
      }
      
      // Reset form and redirect to ideas
      form.reset();
      setSelectedPatronId(null);
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

  const handleCreatePatron = patronForm.handleSubmit((data) => {
    createPatronMutation.mutate(data);
  });

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
                        data-testid="input-idea-title"
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
                        data-testid="input-idea-description"
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
                        data-testid="input-proposed-by"
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
                        data-testid="input-proposed-by-email"
                      />
                    </FormControl>
                    <FormDescription>
                      Pour vous contacter en cas de suivi de l'idée
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Field */}
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Société (optionnel)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Votre société"
                        className="text-base"
                        data-testid="input-company"
                      />
                    </FormControl>
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
                        data-testid="input-deadline"
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

              {/* Patron Selector - Only shown to admin users */}
              {isAdmin && (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Mécène potentiel (optionnel)
                  </FormLabel>
                  <Select 
                    value={selectedPatronId || undefined} 
                    onValueChange={setSelectedPatronId}
                    disabled={isLoadingPatrons}
                  >
                    <SelectTrigger data-testid="select-patron">
                      <SelectValue placeholder="Aucun mécène sélectionné" />
                    </SelectTrigger>
                    <SelectContent>
                      {patrons.map(patron => (
                        <SelectItem 
                          key={patron.id} 
                          value={patron.id}
                          data-testid={`select-patron-option-${patron.id}`}
                        >
                          {patron.firstName} {patron.lastName} - {patron.company || 'Particulier'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Sélectionnez un mécène potentiel pour cette idée
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => setIsPatronDialogOpen(true)}
                      className="ml-2 p-0 h-auto"
                      data-testid="button-new-patron"
                    >
                      <UserPlus className="inline h-4 w-4 mr-1" />
                      Nouveau mécène
                    </Button>
                  </FormDescription>
                </FormItem>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={proposeIdeaMutation.isPending}
                  className="bg-cjd-green hover:bg-green-700 text-white flex-1"
                  size="lg"
                  data-testid="button-submit-idea"
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
                  data-testid="button-cancel"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Dialog for creating a new patron */}
      <Dialog open={isPatronDialogOpen} onOpenChange={setIsPatronDialogOpen}>
        <DialogContent data-testid="dialog-new-patron">
          <DialogHeader>
            <DialogTitle>Nouveau mécène potentiel</DialogTitle>
            <DialogDescription>
              Ajoutez les informations du mécène potentiel pour cette idée
            </DialogDescription>
          </DialogHeader>
          
          <Form {...patronForm}>
            <form onSubmit={handleCreatePatron} className="space-y-4">
              <FormField
                control={patronForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Prénom *" 
                        {...field} 
                        data-testid="input-patron-firstname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={patronForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Nom *" 
                        {...field} 
                        data-testid="input-patron-lastname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={patronForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Email *" 
                        {...field} 
                        data-testid="input-patron-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={patronForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Société" 
                        {...field} 
                        data-testid="input-patron-company"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={patronForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Téléphone" 
                        {...field} 
                        data-testid="input-patron-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={patronForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Fonction" 
                        {...field} 
                        data-testid="input-patron-role"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsPatronDialogOpen(false);
                    patronForm.reset();
                  }}
                  data-testid="button-cancel-patron"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={createPatronMutation.isPending}
                  data-testid="button-create-patron"
                >
                  {createPatronMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer le mécène"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
