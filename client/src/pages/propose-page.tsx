"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { Plus, Lightbulb, Calendar, Send, Loader2, UserPlus } from "lucide-react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { insertIdeaSchema, insertPatronSchema, proposeMemberSchema, type InsertIdea, type InsertPatron, type Patron } from "@shared/schema";
import { z } from "zod";
import { getShortAppName } from '@/config/branding';
import { createIdea } from "../../../app/actions/ideas";
import { createVote } from "../../../app/actions/ideas";
import { proposeMember } from "../../../app/actions/members";

// Form schema with client-side validation matching server schema
const proposeIdeaFormSchema = insertIdeaSchema.extend({
  deadline: insertIdeaSchema.shape.deadline.optional(),
});

type ProposeIdeaForm = InsertIdea & {
  deadline?: string;
};

// Form schema for admin patron creation in dialog (NO proposer fields)
const adminPatronFormSchema = insertPatronSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  company: true,
  phone: true,
  role: true,
}).extend({
  notes: z.string().optional(),
});

type AdminPatronForm = {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  role?: string;
  notes?: string;
};

// Form schema for PUBLIC patron proposal (WITH proposer fields)
const patronProposalFormSchema = insertPatronSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  company: true,
  phone: true,
  role: true,
}).extend({
  notes: z.string().optional(),
  proposerFirstName: z.string().min(2, "Prénom requis"),
  proposerLastName: z.string().min(2, "Nom requis"),
  proposerEmail: z.string().email("Email invalide"),
  proposerCompany: z.string().optional(),
});

type PatronProposalForm = {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  role?: string;
  notes?: string;
  proposerFirstName: string;
  proposerLastName: string;
  proposerEmail: string;
  proposerCompany?: string;
};

// Form schema for member proposal with required fields
const proposeMembreFormSchema = proposeMemberSchema.omit({ proposedBy: true }).extend({
  proposerFirstName: z.string().min(2, "Prénom requis"),
  proposerLastName: z.string().min(2, "Nom requis"),
  proposerEmail: z.string().email("Email invalide"),
  proposerCompany: z.string().optional(),
});

type ProposeMemberForm = {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  role?: string;
  notes?: string;
  proposerFirstName: string;
  proposerLastName: string;
  proposerEmail: string;
  proposerCompany?: string;
};

// LocalStorage key for saved proposer info
const PROPOSER_INFO_KEY = 'cjd_proposer_info';

// Type for saved proposer information
interface SavedProposerInfo {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}

export default function ProposePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  // Proposal type state
  type ProposalType = 'idea' | 'patron' | 'member';
  const [proposalType, setProposalType] = useState<ProposalType>('idea');

  // Patron-related state
  const [selectedPatronId, setSelectedPatronId] = useState<string | null>(null);
  const [isPatronDialogOpen, setIsPatronDialogOpen] = useState(false);

  // Remember me state
  const [rememberMe, setRememberMe] = useState(false);

  // Loading states for Server Actions
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // Feature flags for Server Actions
  const useServerActionsIdeas = process.env.NEXT_PUBLIC_USE_SERVER_ACTIONS_IDEAS === 'true';
  const useServerActionsMembers = process.env.NEXT_PUBLIC_USE_SERVER_ACTIONS_MEMBERS === 'true';
  
  // Load saved proposer info
  const loadSavedProposerInfo = (): SavedProposerInfo | null => {
    try {
      const saved = localStorage.getItem(PROPOSER_INFO_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };
  
  // Save proposer info to localStorage
  const saveProposerInfo = (info: SavedProposerInfo) => {
    try {
      localStorage.setItem(PROPOSER_INFO_KEY, JSON.stringify(info));
    } catch (error) {
      console.error('Error saving proposer info:', error);
    }
  };
  
  // Clear saved proposer info
  const clearProposerInfo = () => {
    try {
      localStorage.removeItem(PROPOSER_INFO_KEY);
    } catch (error) {
      console.error('Error clearing proposer info:', error);
    }
  };

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

  // Separate form for patron creation (used in admin dialog - NO proposer fields)
  const patronForm = useForm<AdminPatronForm>({
    resolver: zodResolver(adminPatronFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
      role: "",
      notes: "",
    },
  });

  // Formulaire pour proposition de mécène (public form - WITH proposer fields)
  const patronProposalForm = useForm<PatronProposalForm>({
    resolver: zodResolver(patronProposalFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
      role: "",
      notes: "",
      proposerFirstName: "",
      proposerLastName: "",
      proposerEmail: "",
      proposerCompany: "",
    },
  });

  // Formulaire pour proposition de membre
  const memberProposalForm = useForm<ProposeMemberForm>({
    resolver: zodResolver(proposeMembreFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      company: "",
      phone: "",
      role: "",
      notes: "",
      proposerFirstName: "",
      proposerLastName: "",
      proposerEmail: "",
      proposerCompany: "",
    },
  });
  
  // Load saved proposer info on mount and pre-fill forms
  useEffect(() => {
    const savedInfo = loadSavedProposerInfo();
    if (savedInfo) {
      setRememberMe(true);
      
      // Pre-fill idea form (proposedBy is full name)
      form.setValue('proposedBy', `${savedInfo.firstName} ${savedInfo.lastName}`);
      form.setValue('proposedByEmail', savedInfo.email);
      form.setValue('company', savedInfo.company);
      
      // Pre-fill patron proposal form
      patronProposalForm.setValue('proposerFirstName', savedInfo.firstName);
      patronProposalForm.setValue('proposerLastName', savedInfo.lastName);
      patronProposalForm.setValue('proposerEmail', savedInfo.email);
      patronProposalForm.setValue('proposerCompany', savedInfo.company);
      
      // Pre-fill member proposal form
      memberProposalForm.setValue('proposerFirstName', savedInfo.firstName);
      memberProposalForm.setValue('proposerLastName', savedInfo.lastName);
      memberProposalForm.setValue('proposerEmail', savedInfo.email);
      memberProposalForm.setValue('proposerCompany', savedInfo.company);
    }
  }, []);
  
  // Handle remember me checkbox change
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    
    if (checked) {
      // Save current form values
      if (proposalType === 'idea') {
        const fullName = form.getValues('proposedBy') || '';
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        saveProposerInfo({
          firstName,
          lastName,
          email: form.getValues('proposedByEmail') || '',
          company: form.getValues('company') || '',
        });
      } else if (proposalType === 'patron') {
        saveProposerInfo({
          firstName: patronProposalForm.getValues('proposerFirstName') || '',
          lastName: patronProposalForm.getValues('proposerLastName') || '',
          email: patronProposalForm.getValues('proposerEmail') || '',
          company: patronProposalForm.getValues('proposerCompany') || '',
        });
      } else if (proposalType === 'member') {
        saveProposerInfo({
          firstName: memberProposalForm.getValues('proposerFirstName') || '',
          lastName: memberProposalForm.getValues('proposerLastName') || '',
          email: memberProposalForm.getValues('proposerEmail') || '',
          company: memberProposalForm.getValues('proposerCompany') || '',
        });
      }
    } else {
      clearProposerInfo();
    }
  };

  // Check if user is admin (has admin.manage permission)
  const isAdmin = user?.role === "super_admin" || user?.role === "ideas_manager";

  // Query to fetch patrons (only enabled for admin users)
  const { data: patrons = [], isLoading: isLoadingPatrons } = useQuery<Patron[]>({
    queryKey: ["/api/patrons"],
    enabled: isAdmin,
    select: (data: any) => data?.data || []
  });

  // Mutation to create a new patron (admin dialog - NO proposer fields)
  const createPatronMutation = useMutation({
    mutationFn: async (patronData: AdminPatronForm) => {
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

  const proposePatronMutation = useMutation({
    mutationFn: async (patronData: PatronProposalForm) => {
      const { proposerFirstName, proposerLastName, proposerEmail, proposerCompany, ...patronInfo } = patronData;
      
      const dataToSend = {
        ...patronInfo,
        createdBy: proposerEmail,
        notes: patronInfo.notes 
          ? `${patronInfo.notes}\n\nProposé par: ${proposerFirstName} ${proposerLastName}${proposerCompany ? ` (${proposerCompany})` : ''}`
          : `Proposé par: ${proposerFirstName} ${proposerLastName}${proposerCompany ? ` (${proposerCompany})` : ''}`,
      };
      
      const res = await apiRequest("POST", "/api/patrons/propose", dataToSend);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Erreur proposition mécène");
      }
      return await res.json();
    },
    onSuccess: (newPatron) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patrons"] });
      patronProposalForm.reset();
      toast({
        title: "✅ Mécène proposé !",
        description: `${newPatron.firstName} ${newPatron.lastName} a été ajouté au CRM`,
        duration: 5000,
      });
      router.push("/");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const proposeMemberMutation = useMutation({
    mutationFn: async (memberData: ProposeMemberForm) => {
      const { proposerFirstName, proposerLastName, proposerEmail, proposerCompany, ...memberInfo } = memberData;
      const dataToSend = {
        ...memberInfo,
        proposedBy: proposerEmail,
        notes: memberInfo.notes ? `${memberInfo.notes}\n\nProposé par: ${proposerFirstName} ${proposerLastName} (${proposerCompany || 'N/A'})` : `Proposé par: ${proposerFirstName} ${proposerLastName} (${proposerCompany || 'N/A'})`,
      };
      const res = await apiRequest("POST", "/api/members/propose", dataToSend);
      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 409) {
          throw new Error("Ce membre existe déjà dans le système");
        }
        throw new Error(errorText || "Erreur proposition membre");
      }
      return await res.json();
    },
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      memberProposalForm.reset();
      toast({
        title: "✅ Membre proposé !",
        description: `${newMember.data.firstName} ${newMember.data.lastName} a été proposé avec succès`,
        duration: 5000,
      });
      router.push("/");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
        duration: 8000,
      });
    },
  });

  const handleSubmitMember = async (memberData: ProposeMemberForm) => {
    if (useServerActionsMembers) {
      // Use Server Action
      setIsSubmittingMember(true);
      try {
        const { proposerFirstName, proposerLastName, proposerEmail, proposerCompany, ...memberInfo } = memberData;

        const formData = new FormData();
        formData.append('firstName', memberInfo.firstName);
        formData.append('lastName', memberInfo.lastName);
        formData.append('email', memberInfo.email);
        if (memberInfo.company) formData.append('company', memberInfo.company);
        if (memberInfo.phone) formData.append('phone', memberInfo.phone);
        if (memberInfo.role) formData.append('role', memberInfo.role);

        const notesText = memberInfo.notes
          ? `${memberInfo.notes}\n\nProposé par: ${proposerFirstName} ${proposerLastName} (${proposerCompany || 'N/A'})`
          : `Proposé par: ${proposerFirstName} ${proposerLastName} (${proposerCompany || 'N/A'})`;
        formData.append('notes', notesText);
        formData.append('proposedBy', proposerEmail);

        const result = await proposeMember(null, formData);

        if (result.success) {
          // Handle remember me
          if (rememberMe) {
            saveProposerInfo({
              firstName: proposerFirstName,
              lastName: proposerLastName,
              email: proposerEmail,
              company: proposerCompany || '',
            });
          } else {
            clearProposerInfo();
          }

          memberProposalForm.reset();
          toast({
            title: "✅ Membre proposé !",
            description: `${result.data.firstName} ${result.data.lastName} a été proposé avec succès`,
            duration: 5000,
          });
          router.push("/");
        } else {
          toast({
            title: "❌ Erreur",
            description: result.error,
            variant: "destructive",
            duration: 8000,
          });
        }
      } catch (error) {
        console.error('Error submitting member:', error);
        toast({
          title: "❌ Erreur",
          description: error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive",
          duration: 8000,
        });
      } finally {
        setIsSubmittingMember(false);
      }
    } else {
      // Use old API route
      proposeMemberMutation.mutate(memberData);
    }
  };

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
      router.push("/");
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

  const onSubmit = async (data: ProposeIdeaForm) => {
    // Convert deadline to ISO string if provided
    const formattedData = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
    };

    if (useServerActionsIdeas) {
      // Use Server Action
      setIsSubmittingIdea(true);
      try {
        const formData = new FormData();
        formData.append('title', formattedData.title);
        formData.append('description', formattedData.description || '');
        formData.append('proposedBy', formattedData.proposedBy);
        formData.append('proposedByEmail', formattedData.proposedByEmail);
        if (formattedData.company) formData.append('company', formattedData.company);
        if (formattedData.deadline) formData.append('deadline', formattedData.deadline);

        const result = await createIdea(null, formData);

        if (result.success) {
          // Handle remember me
          if (rememberMe && formattedData.proposedBy && formattedData.proposedByEmail) {
            const nameParts = formattedData.proposedBy.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            saveProposerInfo({
              firstName,
              lastName,
              email: formattedData.proposedByEmail,
              company: formattedData.company || '',
            });
          } else if (!rememberMe) {
            clearProposerInfo();
          }

          toast({
            title: "✅ Idée proposée avec succès !",
            description: `"${result.data.title}" a été ajoutée à la Boîte à Kiffs`,
            duration: 5000,
          });
          form.reset();
          setSelectedPatronId(null);
          router.push("/");
        } else {
          toast({
            title: "❌ Erreur lors de la proposition",
            description: result.error,
            variant: "destructive",
            duration: 8000,
          });
        }
      } catch (error) {
        console.error('Error submitting idea:', error);
        toast({
          title: "❌ Erreur lors de la proposition",
          description: error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive",
          duration: 8000,
        });
      } finally {
        setIsSubmittingIdea(false);
      }
    } else {
      // Use old API route
      proposeIdeaMutation.mutate(formattedData);
    }
  };

  const handleCreatePatron = patronForm.handleSubmit((data) => {
    createPatronMutation.mutate(data);
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-cjd-green/10 p-3 rounded-full">
              <Lightbulb className="h-8 w-8 text-cjd-green" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {proposalType === 'idea' && 'Proposer une idée'}
            {proposalType === 'patron' && 'Proposer un mécène'}
            {proposalType === 'member' && 'Proposer un membre'}
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Partagez vos idées avec la section {getShortAppName()}. Votre proposition sera immédiatement visible 
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
          {/* Proposal Type Selector */}
          <div className="space-y-6 mb-6">
            <div className="space-y-2">
              <label className="text-base font-medium">
                Type de proposition *
              </label>
              <Select 
                value={proposalType} 
                onValueChange={(value) => setProposalType(value as ProposalType)}
              >
                <SelectTrigger data-testid="select-proposal-type">
                  <SelectValue placeholder="Choisissez le type de proposition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea" data-testid="option-proposal-idea">
                    <Lightbulb className="inline h-4 w-4 mr-2" />
                    Idée
                  </SelectItem>
                  <SelectItem value="patron" data-testid="option-proposal-patron">
                    <UserPlus className="inline h-4 w-4 mr-2" />
                    Mécène potentiel
                  </SelectItem>
                  <SelectItem value="member" data-testid="option-proposal-member">
                    <UserPlus className="inline h-4 w-4 mr-2" />
                    Membre potentiel
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Sélectionnez ce que vous souhaitez proposer
              </p>
            </div>

            {/* Conditional Messages */}
            {proposalType === 'idea' && (
              <p className="text-sm text-gray-600 p-3 bg-info-light rounded">
                Vous allez proposer une nouvelle idée à la communauté {getShortAppName()}
              </p>
            )}
            {proposalType === 'patron' && (
              <p className="text-sm text-gray-600 p-3 bg-info-light rounded">
                Vous allez suggérer un mécène potentiel pour soutenir les projets
              </p>
            )}
            {proposalType === 'member' && (
              <p className="text-sm text-gray-600 p-3 bg-success-light rounded">
                Vous allez proposer un nouveau membre pour rejoindre le {getShortAppName()}
              </p>
            )}
          </div>

          {/* Conditional Forms */}
          {proposalType === 'idea' && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Section: Informations de l'idée */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations de l'idée</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-base font-medium">Titre de l'idée *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Organisation d'un afterwork tech"
                            {...field}
                            className="text-base"
                            data-testid="input-idea-title"
                          />
                        </FormControl>
                        <FormDescription>Un titre court et explicite (3-200 caractères)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-base font-medium">Description détaillée (vous pouvez ajouter des images)</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            content={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Décrivez votre idée, ses bénéfices, comment la mettre en œuvre... Vous pouvez ajouter du formatage et des images."
                            maxLength={10000}
                            testId="editor-idea-description"
                          />
                        </FormControl>
                        <FormDescription>Expliquez votre idée en détail avec formatage riche (max 10000 caractères)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section: Vos coordonnées */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Vos coordonnées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="proposedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Votre nom *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Jean Dupont"
                            {...field}
                            className="text-base"
                            data-testid="input-proposed-by"
                          />
                        </FormControl>
                        <FormDescription>Votre nom apparaîtra comme porteur de l'idée</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Société (optionnel)</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="proposedByEmail"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-base font-medium">Votre email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="jean.dupont@exemple.com"
                            {...field}
                            className="text-base"
                            data-testid="input-proposed-by-email"
                          />
                        </FormControl>
                        <FormDescription>Pour vous contacter en cas de suivi de l'idée</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Remember me checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="remember-me-idea" 
                    checked={rememberMe} 
                    onCheckedChange={handleRememberMeChange}
                    data-testid="checkbox-remember-me"
                  />
                  <label
                    htmlFor="remember-me-idea"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Se souvenir de mes coordonnées pour les prochaines propositions
                  </label>
                </div>
              </div>

              {/* Section: Échéance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Échéance (optionnel)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Échéance souhaitée</FormLabel>
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
                      <FormLabel className="text-base font-medium">Mécène potentiel (optionnel)</FormLabel>
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
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={useServerActionsIdeas ? isSubmittingIdea : proposeIdeaMutation.isPending}
                  className="bg-cjd-green hover:bg-success-dark text-white flex-1"
                  size="lg"
                  data-testid="button-submit-idea"
                >
                  {(useServerActionsIdeas ? isSubmittingIdea : proposeIdeaMutation.isPending) ? (
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
                  onClick={() => router.push("/")}
                  className="px-8"
                  size="lg"
                  data-testid="button-cancel"
                >
                  Annuler
                </Button>
              </div>
              </form>
            </Form>
          )}

          {proposalType === 'patron' && (
            <Form {...patronProposalForm}>
              <form onSubmit={patronProposalForm.handleSubmit((data) => proposePatronMutation.mutate(data))} className="space-y-8">
                
                {/* Section: Vos coordonnées */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Vos coordonnées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={patronProposalForm.control}
                      name="proposerFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Votre prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Jean" {...field} data-testid="input-proposer-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={patronProposalForm.control}
                      name="proposerLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Votre nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Dupont" {...field} data-testid="input-proposer-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={patronProposalForm.control}
                      name="proposerEmail"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Votre email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jean.dupont@exemple.com" {...field} data-testid="input-proposer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={patronProposalForm.control}
                      name="proposerCompany"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Votre société (optionnel)</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre société" {...field} data-testid="input-proposer-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Remember me checkbox */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="remember-me-patron" 
                      checked={rememberMe} 
                      onCheckedChange={handleRememberMeChange}
                      data-testid="checkbox-remember-me"
                    />
                    <label
                      htmlFor="remember-me-patron"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Se souvenir de mes coordonnées pour les prochaines propositions
                    </label>
                  </div>
                </div>

                {/* Section: Informations du mécène */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations du mécène</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={patronProposalForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Marie" {...field} data-testid="input-patron-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={patronProposalForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Martin" {...field} data-testid="input-patron-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={patronProposalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="marie.martin@entreprise.com" {...field} data-testid="input-patron-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={patronProposalForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Société</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom de l'entreprise" {...field} data-testid="input-patron-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={patronProposalForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="06 12 34 56 78" {...field} data-testid="input-patron-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={patronProposalForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Fonction</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Directeur Général" {...field} data-testid="input-patron-role" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={patronProposalForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Notes / Informations complémentaires</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ajoutez des informations complémentaires sur ce mécène potentiel..."
                              className="min-h-24"
                              {...field}
                              data-testid="input-patron-notes"
                            />
                          </FormControl>
                          <FormDescription>
                            Contexte, motivations, domaines d'intérêt, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={proposePatronMutation.isPending}
                    className="bg-cjd-green hover:bg-success-dark text-white flex-1"
                    size="lg"
                    data-testid="button-submit-patron"
                  >
                    {proposePatronMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Proposer ce mécène
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="px-8"
                    size="lg"
                    data-testid="button-cancel"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {proposalType === 'member' && (
            <Form {...memberProposalForm}>
              <form onSubmit={memberProposalForm.handleSubmit(handleSubmitMember)} className="space-y-8">
                
                {/* Section: Vos coordonnées */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Vos coordonnées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={memberProposalForm.control}
                      name="proposerFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Votre prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Pierre" {...field} data-testid="input-proposer-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberProposalForm.control}
                      name="proposerLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Votre nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Martin" {...field} data-testid="input-proposer-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberProposalForm.control}
                      name="proposerEmail"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Votre email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="pierre.martin@exemple.com" {...field} data-testid="input-proposer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberProposalForm.control}
                      name="proposerCompany"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Votre société (optionnel)</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre société" {...field} data-testid="input-proposer-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Remember me checkbox */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="remember-me-member" 
                      checked={rememberMe} 
                      onCheckedChange={handleRememberMeChange}
                      data-testid="checkbox-remember-me"
                    />
                    <label
                      htmlFor="remember-me-member"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Se souvenir de mes coordonnées pour les prochaines propositions
                    </label>
                  </div>
                </div>

                {/* Section: Informations du membre */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations du membre potentiel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={memberProposalForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Jean" {...field} data-testid="input-member-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberProposalForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Dupont" {...field} data-testid="input-member-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberProposalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jean.dupont@entreprise.com" {...field} data-testid="input-member-email" />
                          </FormControl>
                          <FormDescription>Email du membre potentiel</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberProposalForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Société</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom de l'entreprise" {...field} data-testid="input-member-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberProposalForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="06 12 34 56 78" {...field} data-testid="input-member-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberProposalForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Fonction</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Chef d'entreprise" {...field} data-testid="input-member-role" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberProposalForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-medium">Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Pourquoi proposez-vous ce membre ? Qui l'a recommandé ?" 
                              className="min-h-24"
                              {...field}
                              data-testid="input-member-notes"
                            />
                          </FormControl>
                          <FormDescription>Informations complémentaires sur cette proposition</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={useServerActionsMembers ? isSubmittingMember : proposeMemberMutation.isPending}
                    className="bg-cjd-green hover:bg-success-dark text-white flex-1"
                    size="lg"
                    data-testid="button-submit-member"
                  >
                    {(useServerActionsMembers ? isSubmittingMember : proposeMemberMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Proposer ce membre
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="px-8"
                    size="lg"
                    data-testid="button-cancel"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          )}
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
      <div className="mt-8 p-4 bg-info-light rounded-lg border-l-4 border-info">
        <h3 className="font-medium text-info-dark mb-2">💡 Conseils pour une bonne idée</h3>
        <ul className="text-sm text-info space-y-1">
          <li>• Soyez clair et concis dans le titre</li>
          <li>• Expliquez les bénéfices pour la section</li>
          <li>• Mentionnez la faisabilité si c'est pertinent</li>
          <li>• N'hésitez pas à proposer votre aide pour la réalisation</li>
        </ul>
      </div>
      </div>
    </Layout>
  );
}
