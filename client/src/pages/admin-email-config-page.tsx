"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Mail, Loader2, Save, Info } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const emailConfigFormSchema = z.object({
  provider: z.string().min(1, "Le fournisseur est requis"),
  host: z.string().min(1, "L'hôte SMTP est requis"),
  port: z.number().min(1, "Le port doit être supérieur à 0").max(65535, "Port invalide"),
  secure: z.boolean(),
  fromName: z.string().min(1, "Le nom d'expéditeur est requis"),
  fromEmail: z.string().email("Adresse email invalide"),
});

type EmailConfigFormValues = z.infer<typeof emailConfigFormSchema>;

export default function AdminEmailConfigPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  // Vérifier permissions
  const isSuperAdmin = user?.role === "super_admin";

  // Query pour charger la config
  const { data: emailConfigResponse, isLoading } = useQuery({
    queryKey: ["/api/admin/email-config"],
    queryFn: async () => {
      const res = await fetch("/api/admin/email-config");
      if (!res.ok) throw new Error('Failed to load email config');
      return res.json();
    },
    enabled: isSuperAdmin,
  });

  const emailConfigData = emailConfigResponse?.data;
  const isDefault = emailConfigData?.isDefault;

  // Form setup
  const form = useForm<EmailConfigFormValues>({
    resolver: zodResolver(emailConfigFormSchema),
    defaultValues: {
      provider: "ovh",
      host: "ssl0.ovh.net",
      port: 465,
      secure: true,
      fromName: "CJD Amiens",
      fromEmail: "noreply@cjd-amiens.fr",
    },
  });

  // Load config when available
  useEffect(() => {
    if (emailConfigData) {
      form.reset({
        provider: emailConfigData.provider || "ovh",
        host: emailConfigData.host,
        port: emailConfigData.port,
        secure: emailConfigData.secure,
        fromName: emailConfigData.fromName || "",
        fromEmail: emailConfigData.fromEmail,
      });
    }
  }, [emailConfigData, form]);

  // Mutation pour sauvegarder
  const saveMutation = useMutation({
    mutationFn: async (values: EmailConfigFormValues) => {
      return await apiRequest("PUT", "/api/admin/email-config", values);
    },
    onSuccess: () => {
      toast({
        title: "Configuration sauvegardée",
        description: "La configuration email a été mise à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-config"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Échec de la sauvegarde de la configuration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: EmailConfigFormValues) => {
    saveMutation.mutate(values);
  };

  // Redirection si non autorisé
  if (!isSuperAdmin && !isLoading) {
    router.push("/admin");
    return <></>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <div className="container mx-auto py-8 px-4">
          <Skeleton className="h-12 w-96 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              Configuration Email SMTP
            </h1>
            <p className="text-muted-foreground mt-2">
              Configurez les paramètres d'envoi d'emails pour les notifications
            </p>
          </div>
          <Badge variant={isDefault ? "outline" : "default"}>
            {isDefault ? "Par défaut" : "Personnalisé"}
          </Badge>
        </div>

        <div className="grid gap-6">
          {/* Informations OVH */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuration OVH recommandée :</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Hôte SMTP : <code className="bg-muted px-1 py-0.5 rounded">ssl0.ovh.net</code></li>
                <li>Port : <code className="bg-muted px-1 py-0.5 rounded">465</code> (SSL/TLS) ou <code className="bg-muted px-1 py-0.5 rounded">587</code> (STARTTLS)</li>
                <li>Sécurisé : Activé pour le port 465, désactivé pour le port 587</li>
                <li>Les identifiants SMTP (utilisateur/mot de passe) sont configurés dans les variables d'environnement pour la sécurité</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Paramètres SMTP</CardTitle>
              <CardDescription>
                Configurez le serveur SMTP pour l'envoi d'emails. Compatible avec OVH et autres fournisseurs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fournisseur SMTP</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-provider">
                              <SelectValue placeholder="Sélectionner un fournisseur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ovh">OVH</SelectItem>
                            <SelectItem value="gmail">Gmail</SelectItem>
                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                            <SelectItem value="mailgun">Mailgun</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Le fournisseur de service email (OVH recommandé)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hôte SMTP</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="ssl0.ovh.net"
                              data-testid="input-smtp-host"
                            />
                          </FormControl>
                          <FormDescription>
                            L'adresse du serveur SMTP
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port SMTP</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              placeholder="465"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-smtp-port"
                            />
                          </FormControl>
                          <FormDescription>
                            465 (SSL) ou 587 (STARTTLS)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="secure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-secure"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Connexion sécurisée (SSL/TLS)
                          </FormLabel>
                          <FormDescription>
                            Activez pour le port 465, désactivez pour le port 587 (STARTTLS)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom d'expéditeur</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="CJD Amiens"
                              data-testid="input-from-name"
                            />
                          </FormControl>
                          <FormDescription>
                            Le nom qui apparaîtra comme expéditeur
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email d'expéditeur</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              placeholder="noreply@cjd-amiens.fr"
                              data-testid="input-from-email"
                            />
                          </FormControl>
                          <FormDescription>
                            L'adresse email qui apparaîtra comme expéditeur
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={saveMutation.isPending}
                      data-testid="button-save-config"
                    >
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enregistrer la configuration
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Documentation supplémentaire */}
          <Card>
            <CardHeader>
              <CardTitle>Notes importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Sécurité des identifiants</h3>
                <p className="text-sm text-muted-foreground">
                  Les identifiants SMTP (nom d'utilisateur et mot de passe) sont stockés de manière sécurisée 
                  dans les variables d'environnement <code className="bg-muted px-1 py-0.5 rounded">SMTP_USER</code> et{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">SMTP_PASS</code>. Ils ne sont pas modifiables depuis cette interface.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Compatibilité</h3>
                <p className="text-sm text-muted-foreground">
                  Cette configuration fonctionne avec la plupart des fournisseurs SMTP standards (OVH, Gmail, SendGrid, etc.). 
                  Consultez la documentation de votre fournisseur pour les paramètres spécifiques.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Test de configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Après avoir enregistré votre configuration, vous pouvez tester l'envoi d'emails via la page de test email admin.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
