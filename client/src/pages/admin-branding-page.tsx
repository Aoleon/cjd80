import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminHeader from "@/components/admin-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useBrandingConfig } from "@/hooks/use-branding-config";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Palette, Loader2, Save, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";
import type { BrandingCore } from "@/config/branding-core";

// Zod validation schema for branding configuration
const brandingFormSchema = z.object({
  // Application
  app: z.object({
    name: z.string().min(3, "Le nom doit contenir au moins 3 caractères").max(100, "Le nom est trop long"),
    shortName: z.string().min(2, "Le nom court doit contenir au moins 2 caractères").max(50, "Le nom court est trop long"),
    description: z.string().min(10, "La description doit contenir au moins 10 caractères").max(500, "La description est trop longue"),
    ideaBoxName: z.string().min(3, "Le nom de la boîte à idées doit contenir au moins 3 caractères").max(100, "Le nom est trop long"),
  }),

  // Organization
  organization: z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom est trop long"),
    fullName: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères").max(200, "Le nom complet est trop long"),
    tagline: z.string().min(10, "Le slogan doit contenir au moins 10 caractères").max(200, "Le slogan est trop long"),
    url: z.string().url("URL invalide").optional().or(z.literal("")),
    email: z.string().email("Adresse email invalide"),
  }),

  // Appearance - Colors
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide"),
    primaryDark: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide"),
    primaryLight: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide"),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide"),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide"),
  }),

  // Appearance - Fonts
  fonts: z.object({
    primary: z.string().min(2, "Le nom de la police doit contenir au moins 2 caractères"),
    googleFontsUrl: z.string().url("URL invalide").optional().or(z.literal("")),
    weights: z.array(z.number()).optional(),
  }),

  // PWA
  pwa: z.object({
    themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide"),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide"),
    display: z.string().optional(),
    orientation: z.string().optional(),
    categories: z.array(z.string()).optional(),
    lang: z.string().optional(),
  }),

  // Social
  social: z.object({
    ogType: z.string().min(2, "Type OG invalide"),
    twitterCard: z.string().min(2, "Type de carte Twitter invalide"),
  }),

  // Links
  links: z.object({
    website: z.string().url("URL invalide").optional().or(z.literal("")),
    support: z.string().min(5, "URL ou email de support invalide"),
  }),
});

type BrandingFormValues = z.infer<typeof brandingFormSchema>;

export default function AdminBrandingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { reloadBranding } = useBrandingConfig();
  
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  // Vérifier permissions SUPER_ADMIN
  const isSuperAdmin = user?.role === "super_admin";

  // Query pour charger la config
  const { data: brandingResponse, isLoading } = useQuery({
    queryKey: ["/api/admin/branding"],
    queryFn: async () => {
      const res = await fetch("/api/admin/branding");
      if (!res.ok) throw new Error('Failed to load branding');
      return res.json();
    },
    enabled: isSuperAdmin,
  });

  const brandingData = brandingResponse?.data;
  const isCustomized = brandingData && !brandingData.isDefault;

  // Form setup
  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      app: {
        name: "",
        shortName: "",
        description: "",
        ideaBoxName: "",
      },
      organization: {
        name: "",
        fullName: "",
        tagline: "",
        url: "",
        email: "",
      },
      colors: {
        primary: "#00a844",
        primaryDark: "#008835",
        primaryLight: "#00c94f",
        secondary: "#1a1a1a",
        background: "#f9fafb",
      },
      fonts: {
        primary: "Lato",
        googleFontsUrl: "",
        weights: [300, 400, 700, 900],
      },
      pwa: {
        themeColor: "#00a844",
        backgroundColor: "#f9fafb",
        display: "standalone",
        orientation: "portrait-primary",
        categories: ["business", "productivity", "social"],
        lang: "fr-FR",
      },
      social: {
        ogType: "website",
        twitterCard: "summary",
      },
      links: {
        website: "",
        support: "",
      },
    },
  });

  // Load branding data into form when available
  useEffect(() => {
    if (brandingData && brandingData.config) {
      try {
        const config: BrandingCore = JSON.parse(brandingData.config);
        form.reset(config as any);
      } catch (error) {
        console.error("Failed to parse branding config:", error);
      }
    }
  }, [brandingData, form]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (config: BrandingFormValues) => {
      const res = await fetch("/api/admin/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: JSON.stringify(config) })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Branding sauvegardé avec succès" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branding"] });
      reloadBranding();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le branding",
        variant: "destructive",
      });
    },
  });

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/branding", {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reset');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Configuration réinitialisée aux valeurs par défaut" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branding"] });
      reloadBranding();
      setIsResetDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réinitialiser la configuration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BrandingFormValues) => {
    saveMutation.mutate(data);
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Cette page est réservée aux super-administrateurs uniquement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/admin")} data-testid="button-back-admin">
              Retour au panneau d'administration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-cjd-green" />
                  Personnalisation du branding
                </CardTitle>
                <CardDescription>
                  Personnaliser les couleurs, logos et textes de l'application
                </CardDescription>
              </div>
              <Badge 
                variant={isCustomized ? "default" : "secondary"}
                className={isCustomized ? "bg-cjd-green" : ""}
                data-testid="badge-branding-status"
              >
                {isCustomized ? "Personnalisé" : "Par défaut"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Accordion type="single" collapsible className="w-full" defaultValue="app">
                  {/* Section Application */}
                  <AccordionItem value="app" data-testid="accordion-app">
                    <AccordionTrigger className="text-lg font-semibold">
                      📱 Application
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="app.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l'application</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="CJD Amiens - Boîte à Kiffs" data-testid="input-app-name" />
                            </FormControl>
                            <FormDescription>
                              Nom complet affiché dans le titre de la page
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="app.shortName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom court</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="CJD Amiens" data-testid="input-app-short-name" />
                            </FormControl>
                            <FormDescription>
                              Version courte du nom pour les espaces réduits
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="app.description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Application interne du Centre des Jeunes Dirigeants..."
                                rows={3}
                                data-testid="input-app-description"
                              />
                            </FormControl>
                            <FormDescription>
                              Description de l'application pour les métadonnées
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="app.ideaBoxName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de la boîte à idées</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Boîte à Kiffs" data-testid="input-app-idea-box-name" />
                            </FormControl>
                            <FormDescription>
                              Nom personnalisé pour la fonctionnalité de partage d'idées
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section Organisation */}
                  <AccordionItem value="organization" data-testid="accordion-organization">
                    <AccordionTrigger className="text-lg font-semibold">
                      🏢 Organisation
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="organization.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l'organisation</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="CJD Amiens" data-testid="input-org-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="organization.fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet de l'organisation</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Centre des Jeunes Dirigeants d'Amiens" data-testid="input-org-full-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="organization.tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slogan</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Application collaborative pour le partage d'idées..."
                                rows={2}
                                data-testid="input-org-tagline"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="organization.url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL du site web</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" placeholder="https://votre-domaine.com" data-testid="input-org-url" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="organization.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email de contact</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="contact@cjd-amiens.fr" data-testid="input-org-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section Apparence */}
                  <AccordionItem value="appearance" data-testid="accordion-appearance">
                    <AccordionTrigger className="text-lg font-semibold">
                      🎨 Apparence
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground">Couleurs</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="colors.primary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Couleur principale</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input {...field} type="color" className="w-20 h-10" data-testid="input-color-primary" />
                                  </FormControl>
                                  <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} placeholder="#00a844" data-testid="input-color-primary-text" />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="colors.primaryDark"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Couleur principale (sombre)</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input {...field} type="color" className="w-20 h-10" data-testid="input-color-primary-dark" />
                                  </FormControl>
                                  <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} placeholder="#008835" data-testid="input-color-primary-dark-text" />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="colors.primaryLight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Couleur principale (claire)</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input {...field} type="color" className="w-20 h-10" data-testid="input-color-primary-light" />
                                  </FormControl>
                                  <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} placeholder="#00c94f" data-testid="input-color-primary-light-text" />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="colors.secondary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Couleur secondaire</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input {...field} type="color" className="w-20 h-10" data-testid="input-color-secondary" />
                                  </FormControl>
                                  <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} placeholder="#1a1a1a" data-testid="input-color-secondary-text" />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="colors.background"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Couleur de fond</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input {...field} type="color" className="w-20 h-10" data-testid="input-color-background" />
                                  </FormControl>
                                  <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} placeholder="#f9fafb" data-testid="input-color-background-text" />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-medium text-sm text-muted-foreground">Typographie</h4>
                        
                        <FormField
                          control={form.control}
                          name="fonts.primary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Police principale</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Lato" data-testid="input-font-primary" />
                              </FormControl>
                              <FormDescription>
                                Nom de la police Google Fonts
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fonts.googleFontsUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Google Fonts (optionnel)</FormLabel>
                              <FormControl>
                                <Input {...field} type="url" placeholder="https://fonts.googleapis.com/css2?family=Lato..." data-testid="input-font-url" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section PWA & Métadonnées */}
                  <AccordionItem value="pwa" data-testid="accordion-pwa">
                    <AccordionTrigger className="text-lg font-semibold">
                      📲 PWA & Métadonnées
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pwa.themeColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Couleur du thème PWA</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input {...field} type="color" className="w-20 h-10" data-testid="input-pwa-theme-color" />
                                </FormControl>
                                <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} placeholder="#00a844" data-testid="input-pwa-theme-color-text" />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pwa.backgroundColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Couleur de fond PWA</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input {...field} type="color" className="w-20 h-10" data-testid="input-pwa-bg-color" />
                                </FormControl>
                                <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} placeholder="#f9fafb" data-testid="input-pwa-bg-color-text" />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="pt-4 border-t space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground">Réseaux sociaux</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="social.ogType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type Open Graph</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="website" data-testid="input-social-og-type" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="social.twitterCard"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type de carte Twitter</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="summary" data-testid="input-social-twitter-card" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Section Liens */}
                  <AccordionItem value="links" data-testid="accordion-links">
                    <AccordionTrigger className="text-lg font-semibold">
                      🔗 Liens externes
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <FormField
                        control={form.control}
                        name="links.website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site web principal</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" placeholder="https://cjd-amiens.fr" data-testid="input-link-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="links.support"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact support</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="mailto:support@cjd-amiens.fr" data-testid="input-link-support" />
                            </FormControl>
                            <FormDescription>
                              Email (mailto:...) ou URL de support
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex-1"
                    data-testid="button-save-branding"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsResetDialogOpen(true)}
                    disabled={resetMutation.isPending || !isCustomized}
                    data-testid="button-reset-branding"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Réinitialiser aux valeurs par défaut
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      {/* Reset confirmation dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent data-testid="dialog-reset-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la réinitialisation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir réinitialiser la configuration aux valeurs par défaut ?
              Cette action supprimera toutes les personnalisations actuelles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-reset">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-reset"
            >
              {resetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                "Réinitialiser"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
