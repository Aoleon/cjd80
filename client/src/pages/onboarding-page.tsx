import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useBrandingConfig } from "@/hooks/use-branding-config";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Loader2, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  Palette,
  Mail,
  Upload,
  CheckCircle,
  Shield,
  Send,
  AlertCircle,
  Download,
  FileUp,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";
import type { BrandingCore } from "@/config/branding-core";
import { brandingCore } from "@/config/branding-core";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Système d'Onboarding - Configuration Initiale de l'Application
 * 
 * Ce composant gère le processus d'onboarding pour une première installation.
 * Il guide l'utilisateur à travers 6 étapes :
 * 1. Organisation - Informations de base de l'organisation
 * 2. Couleurs - Personnalisation de la palette de couleurs
 * 3. Email - Configuration SMTP pour les notifications
 * 4. Logo - Upload et personnalisation du logo
 * 5. Admin - Création du compte administrateur initial
 * 6. Récapitulatif - Vérification finale avant finalisation
 * 
 * Fonctionnalités :
 * - Sauvegarde automatique de la progression dans localStorage
 * - Validation en temps réel avec feedback visuel
 * - Compression automatique des images
 * - Extraction de couleurs depuis le logo
 * - Validation du contraste WCAG
 * - Métriques de performance pour analyse
 * - Gestion robuste des erreurs avec retry automatique
 */

// Schémas de validation
/**
 * Valide une URL en utilisant l'API native URL
 * @param url - URL à valider
 * @returns true si l'URL est valide (http:// ou https://), false sinon
 */
const urlValidator = (url: string) => {
  if (!url || url.trim() === '') return true; // URL optionnelle
  try {
    const parsed = new URL(url);
    // Vérifier que c'est http ou https
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const organizationSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  fullName: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères").max(200),
  tagline: z.string().min(10, "Le slogan doit contenir au moins 10 caractères").max(200),
  url: z.string().refine(urlValidator, { message: "URL invalide. Utilisez http:// ou https://" }).optional().or(z.literal("")),
  email: z.string().email("Adresse email invalide"),
});

const colorsSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide"),
  primaryDark: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide"),
  primaryLight: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide"),
});

const emailConfigSchema = z.object({
  provider: z.enum(['ovh', 'gmail', 'outlook', 'smtp', 'other']),
  host: z.string().min(1, "L'hôte SMTP est requis"),
  port: z.number().min(1).max(65535),
  secure: z.boolean(),
  fromName: z.string().optional(),
  fromEmail: z.string().email("Email invalide"),
});

// Types TypeScript dérivés des schémas Zod
type OrganizationFormValues = z.infer<typeof organizationSchema>;
type ColorsFormValues = z.infer<typeof colorsSchema>;
type EmailConfigFormValues = z.infer<typeof emailConfigSchema>;

/**
 * Configuration des étapes de l'onboarding
 * Chaque étape a un ID unique, un label et une icône
 */
const STEPS = [
  { id: 'organization', label: 'Organisation', icon: Building2 },
  { id: 'colors', label: 'Couleurs', icon: Palette },
  { id: 'email', label: 'Email SMTP', icon: Mail },
  { id: 'logo', label: 'Logo', icon: Upload },
  { id: 'admin', label: 'Compte Admin', icon: Shield },
  { id: 'summary', label: 'Récapitulatif', icon: CheckCircle },
] as const;

type StepId = typeof STEPS[number]['id'];

export default function OnboardingPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { reloadBranding } = useBrandingConfig();
  
  const [currentStep, setCurrentStep] = useState<StepId>('organization');
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; feedback: string[] }>({ score: 0, feedback: [] });

  // Clé localStorage pour sauvegarder la progression
  const ONBOARDING_STORAGE_KEY = 'onboarding_progress';

  // Métriques de performance (suivi des temps et erreurs)
  const performanceMetrics = useRef({
    startTime: Date.now(),
    stepTimes: {} as Record<StepId, { start: number; end?: number }>,
    errors: [] as Array<{ step: StepId; error: string; timestamp: number }>,
    apiCalls: 0,
    apiErrors: 0,
    apiSuccesses: 0,
  });

  // Fonction utilitaire pour enregistrer les erreurs
  const logError = useCallback((step: StepId, error: string) => {
    performanceMetrics.current.errors.push({
      step,
      error,
      timestamp: Date.now(),
    });
    performanceMetrics.current.apiErrors++;
  }, []);

  // Fonction utilitaire pour enregistrer les succès API
  const logApiSuccess = useCallback(() => {
    performanceMetrics.current.apiSuccesses++;
    performanceMetrics.current.apiCalls++;
  }, []);

  // Fonction utilitaire pour enregistrer les appels API
  const logApiCall = useCallback(() => {
    performanceMetrics.current.apiCalls++;
  }, []);

  // Vérifier l'état de l'installation avec retry automatique
  const { data: setupStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["/api/setup/status"],
    queryFn: async () => {
      const res = await fetch("/api/setup/status");
      if (!res.ok) throw new Error('Failed to load setup status');
      return res.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000,
  });

  // Formulaires (déclarés en premier pour être utilisés dans les callbacks)
  const organizationForm = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      fullName: "",
      tagline: "",
      url: "",
      email: "",
    },
  });

  const colorsForm = useForm<ColorsFormValues>({
    resolver: zodResolver(colorsSchema),
    defaultValues: {
      primary: brandingCore.colors.primary,
      primaryDark: brandingCore.colors.primaryDark,
      primaryLight: brandingCore.colors.primaryLight,
    },
  });

  const emailForm = useForm<EmailConfigFormValues>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      provider: 'smtp',
      host: "",
      port: 587,
      secure: false,
      fromName: "",
      fromEmail: "",
    },
  });

  // Sauvegarder la progression dans localStorage (mémorisé)
  const saveProgress = useCallback(() => {
    try {
      const progress = {
        currentStep,
        completedSteps,
        organization: organizationForm.getValues(),
        colors: colorsForm.getValues(),
        email: emailForm.getValues(),
        adminForm,
        logoUploaded,
        timestamp: Date.now(),
      };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      // Erreur non-critique, on continue silencieusement
      if (import.meta.env.DEV) {
        console.warn('Impossible de sauvegarder la progression:', error);
      }
    }
  }, [currentStep, completedSteps, adminForm, logoUploaded, organizationForm, colorsForm, emailForm]);

  // Exporter la configuration (mémorisé)
  const exportConfiguration = useCallback(() => {
    try {
      const config = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        organization: organizationForm.getValues(),
        colors: colorsForm.getValues(),
        email: emailForm.getValues(),
        // Note: on n'exporte pas le mot de passe admin pour des raisons de sécurité
        metadata: {
          logoUploaded,
          completedSteps,
        },
      };
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onboarding-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Configuration exportée",
        description: "Votre configuration a été téléchargée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter la configuration.",
        variant: "destructive",
      });
    }
  }, [organizationForm, colorsForm, emailForm, logoUploaded, completedSteps, toast]);

  // Importer la configuration (mémorisé)
  const importConfiguration = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        
        if (config.organization) {
          organizationForm.reset(config.organization);
        }
        if (config.colors) {
          colorsForm.reset(config.colors);
        }
        if (config.email) {
          emailForm.reset(config.email);
        }
        
        toast({
          title: "Configuration importée",
          description: "Votre configuration a été chargée avec succès.",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Le fichier de configuration est invalide.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  }, [organizationForm, colorsForm, emailForm, toast]);

  // Charger la progression depuis localStorage (mémorisé)
  const loadProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const progress = JSON.parse(stored);
        // Ne restaurer que si la sauvegarde est récente (moins de 24h)
        const maxAge = 24 * 60 * 60 * 1000; // 24 heures
        if (Date.now() - progress.timestamp < maxAge) {
          if (progress.currentStep) setCurrentStep(progress.currentStep);
          if (progress.completedSteps) setCompletedSteps(progress.completedSteps);
          if (progress.organization) organizationForm.reset(progress.organization);
          if (progress.colors) colorsForm.reset(progress.colors);
          if (progress.email) emailForm.reset(progress.email);
          if (progress.adminForm) setAdminForm(progress.adminForm);
          if (progress.logoUploaded) setLogoUploaded(progress.logoUploaded);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Impossible de charger la progression:', error);
      }
    }
  }, [organizationForm, colorsForm, emailForm]);

  // Initialiser les métriques de performance au montage
  useEffect(() => {
    performanceMetrics.current.startTime = Date.now();
    performanceMetrics.current.stepTimes[currentStep] = { start: Date.now() };
  }, []);

  // Charger la progression au montage (une seule fois)
  useEffect(() => {
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarder automatiquement à chaque changement avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProgress();
    }, 500); // Debounce de 500ms pour éviter trop de sauvegardes
    
    return () => clearTimeout(timer);
  }, [currentStep, completedSteps, logoUploaded, saveProgress]);

  // Si l'installation est complète, rediriger
  useEffect(() => {
    if (setupStatus?.data && !setupStatus.data.isFirstInstall) {
      setLocation("/");
    }
  }, [setupStatus, setLocation]);

  // Déterminer l'étape initiale selon l'état
  useEffect(() => {
    if (setupStatus?.data) {
      const steps = setupStatus.data.completedSteps || {};
      // Si pas d'admins, commencer par la création d'admin
      if (!steps.admins && !setupStatus.data.hasAdmins) {
        setCurrentStep('admin');
      }
    }
  }, [setupStatus]);

  // Navigation entre les étapes
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;
  
  // Calculer le pourcentage de complétion par étape
  const getStepCompletion = (stepId: StepId): number => {
    switch (stepId) {
      case 'organization':
        const orgValues = organizationForm.getValues();
        return (
          (orgValues.name ? 20 : 0) +
          (orgValues.fullName ? 20 : 0) +
          (orgValues.email ? 20 : 0) +
          (orgValues.tagline ? 20 : 0) +
          (orgValues.url ? 20 : 0)
        ) / 5;
      case 'colors':
        return 100; // Toujours complété si on est sur cette étape
      case 'email':
        const emailValues = emailForm.getValues();
        return (
          (emailValues.host ? 25 : 0) +
          (emailValues.port ? 25 : 0) +
          (emailValues.fromEmail ? 25 : 0) +
          (emailTestResult?.success ? 25 : 0)
        ) / 4;
      case 'logo':
        return logoUploaded ? 100 : 0;
      case 'admin':
        const adminComplete = adminForm.email && adminForm.password && 
                             adminForm.firstName && adminForm.lastName &&
                             adminForm.password === adminForm.confirmPassword;
        return adminComplete ? 100 : 0;
      case 'summary':
        return 100;
      default:
        return 0;
    }
  };

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      // Enregistrer le temps passé sur l'étape actuelle
      const currentStepId = STEPS[currentStepIndex].id;
      if (performanceMetrics.current.stepTimes[currentStepId]) {
        performanceMetrics.current.stepTimes[currentStepId].end = Date.now();
      }
      
      // Démarrer le suivi de la nouvelle étape
      const nextStepId = STEPS[currentStepIndex + 1].id;
      performanceMetrics.current.stepTimes[nextStepId] = { start: Date.now() };
      
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(nextStepId);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentStepIndex]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      // Enregistrer le temps passé sur l'étape actuelle
      const currentStepId = STEPS[currentStepIndex].id;
      if (performanceMetrics.current.stepTimes[currentStepId]) {
        performanceMetrics.current.stepTimes[currentStepId].end = Date.now();
      }
      
      // Démarrer le suivi de la nouvelle étape
      const prevStepId = STEPS[currentStepIndex - 1].id;
      if (!performanceMetrics.current.stepTimes[prevStepId]) {
        performanceMetrics.current.stepTimes[prevStepId] = { start: Date.now() };
      }
      
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prevStepId);
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentStepIndex]);

  // Raccourcis clavier pour la navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on est dans un input, textarea, etc.
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }

      // Flèche droite ou Espace : étape suivante
      if (e.key === 'ArrowRight' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        goToNextStep();
      }

      // Flèche gauche ou Shift+Espace : étape précédente
      if (e.key === 'ArrowLeft' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        goToPreviousStep();
      }

      // Échap : retour à l'accueil (si pas de première installation)
      if (e.key === 'Escape' && !setupStatus?.data?.isFirstInstall) {
        e.preventDefault();
        setLocation("/");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, setupStatus, setLocation]);

  // Charger les données existantes si disponibles
  useEffect(() => {
    if (setupStatus?.data?.completedSteps) {
      const steps = setupStatus.data.completedSteps;
      if (steps.branding) {
        // Charger le branding existant
        fetch("/api/admin/branding")
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data?.config) {
              try {
                const config: BrandingCore = JSON.parse(data.data.config);
                organizationForm.reset({
                  name: config.organization.name,
                  fullName: config.organization.fullName,
                  tagline: config.organization.tagline,
                  url: config.organization.url || "",
                  email: config.organization.email,
                });
                colorsForm.reset({
                  primary: config.colors.primary,
                  primaryDark: config.colors.primaryDark,
                  primaryLight: config.colors.primaryLight,
                });
                setCompletedSteps(['organization', 'colors']);
              } catch (error) {
                console.error("Failed to parse branding config:", error);
              }
            }
          });
      }
      if (steps.email) {
        // Charger la config email existante
        fetch("/api/admin/email-config")
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              emailForm.reset({
                provider: data.data.provider || 'ovh',
                host: data.data.host,
                port: data.data.port,
                secure: data.data.secure,
                fromName: data.data.fromName || "",
                fromEmail: data.data.fromEmail,
              });
              setCompletedSteps(prev => [...prev, 'email']);
            }
          });
      }
    }
  }, [setupStatus]);

  // Mutations
  const saveBrandingMutation = useMutation({
    mutationFn: async (data: { organization: OrganizationFormValues; colors: ColorsFormValues }) => {
      logApiCall();
      try {
        // Construire la config complète avec les valeurs par défaut
        const fullConfig = {
          ...brandingCore,
          organization: {
            ...brandingCore.organization,
            ...data.organization,
          },
          colors: {
            ...brandingCore.colors,
            ...data.colors,
          },
        };
        
        const result = await apiRequest("PUT", "/api/admin/branding", {
          config: JSON.stringify(fullConfig)
        });
        logApiSuccess();
        return result;
      } catch (error) {
        logError('organization', error instanceof Error ? error.message : 'Erreur inconnue');
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Configuration organisation et couleurs sauvegardée" });
      setCompletedSteps(prev => {
        const newSteps = [...prev];
        if (!newSteps.includes('organization')) newSteps.push('organization');
        if (!newSteps.includes('colors')) newSteps.push('colors');
        return newSteps;
      });
      reloadBranding();
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Impossible de sauvegarder";
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch');
      const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('Timeout');
      
      // Enregistrer l'erreur dans les métriques
      logError('organization', errorMessage);
      
      toast({
        title: isNetworkError ? "Erreur de connexion" : isTimeout ? "Délai d'attente dépassé" : "Erreur",
        description: isNetworkError 
          ? "Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez."
          : isTimeout
          ? "Le serveur met trop de temps à répondre. Veuillez réessayer."
          : errorMessage,
        variant: "destructive",
      });
    },
    retry: (failureCount, error) => {
      const errorMessage = error?.message || "";
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch');
      const maxRetries = isNetworkError ? 3 : 2;
      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => {
      // Backoff exponentiel : 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attemptIndex), 4000);
    },
  });

  const saveEmailMutation = useMutation({
    mutationFn: async (data: EmailConfigFormValues) => {
      logApiCall();
      try {
        const result = await apiRequest("PUT", "/api/admin/email-config", data);
        logApiSuccess();
        return result;
      } catch (error) {
        logError('email', error instanceof Error ? error.message : 'Erreur inconnue');
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Configuration email sauvegardée" });
      setCompletedSteps(prev => {
        const newSteps = [...prev];
        if (!newSteps.includes('email')) newSteps.push('email');
        return newSteps;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-config"] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Impossible de sauvegarder la configuration email";
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch');
      const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('Timeout');
      
      // Enregistrer l'erreur dans les métriques
      logError('email', errorMessage);
      
      toast({
        title: isNetworkError ? "Erreur de connexion" : isTimeout ? "Délai d'attente dépassé" : "Erreur",
        description: isNetworkError 
          ? "Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez."
          : isTimeout
          ? "Le serveur met trop de temps à répondre. Veuillez réessayer."
          : errorMessage,
        variant: "destructive",
      });
    },
    retry: (failureCount, error) => {
      const errorMessage = error?.message || "";
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch');
      const maxRetries = isNetworkError ? 3 : 2;
      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => {
      // Backoff exponentiel : 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attemptIndex), 4000);
    },
  });

  // Handlers
  const handleOrganizationSubmit = (data: OrganizationFormValues) => {
    const colorsData = colorsForm.getValues();
    saveBrandingMutation.mutate({ organization: data, colors: colorsData });
    goToNextStep();
  };

  const handleColorsSubmit = (data: ColorsFormValues) => {
    const orgData = organizationForm.getValues();
    saveBrandingMutation.mutate({ organization: orgData, colors: data });
    goToNextStep();
  };

  // Helper pour extraire le domaine d'un email (mémorisé)
  const getEmailDomain = useCallback((email: string): string | null => {
    const match = email.match(/@([^@]+)$/);
    return match ? match[1].toLowerCase() : null;
  }, []);

  // Fonction pour calculer la force du mot de passe (mémorisé)
  const calculatePasswordStrength = useCallback((password: string): { score: number; feedback: string[] } => {
    if (!password) return { score: 0, feedback: [] };
    
    let score = 0;
    const feedback: string[] = [];
    
    // Longueur minimale
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("Au moins 8 caractères");
    }
    
    // Longueur recommandée
    if (password.length >= 12) {
      score += 1;
    }
    
    // Contient des minuscules
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Lettres minuscules");
    }
    
    // Contient des majuscules
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Lettres majuscules");
    }
    
    // Contient des chiffres
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("Chiffres");
    }
    
    // Contient des caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Caractères spéciaux");
    }
    
    return { score: Math.min(score, 5), feedback: feedback.length > 0 ? feedback : [] };
  }, []);

  // Fonction pour ajuster la luminosité d'une couleur (mémorisé)
  const adjustColorBrightness = useCallback((hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }, []);

  // Fonction pour calculer la luminosité relative d'une couleur (pour WCAG) (mémorisé)
  const getLuminance = useCallback((hex: string): number => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }, []);

  // Fonction pour calculer le ratio de contraste entre deux couleurs (mémorisé)
  const getContrastRatio = useCallback((color1: string, color2: string): number => {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }, [getLuminance]);

  // Fonction pour valider le contraste WCAG (mémorisé)
  const validateContrast = useCallback((foreground: string, background: string): { ratio: number; passesAA: boolean; passesAAA: boolean; level: string } => {
    const ratio = getContrastRatio(foreground, background);
    const passesAA = ratio >= 4.5; // WCAG AA pour texte normal
    const passesAAA = ratio >= 7; // WCAG AAA pour texte normal
    
    let level = 'Échec';
    if (passesAAA) level = 'AAA';
    else if (passesAA) level = 'AA';
    else if (ratio >= 3) level = 'AA (grand texte)';
    
    return { ratio, passesAA, passesAAA, level };
  }, [getContrastRatio]);

  // Fonction pour compresser une image (mémorisé)
  const compressImage = useCallback((file: File, maxWidth: number = 2000, maxHeight: number = 2000, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculer les nouvelles dimensions en conservant le ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }
          
          // Créer un canvas avec les nouvelles dimensions
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Impossible de créer le contexte canvas'));
            return;
          }
          
          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir en blob avec compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Impossible de compresser l\'image'));
                return;
              }
              
              // Créer un nouveau File avec le blob compressé
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Impossible de charger l\'image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Fonction pour extraire les couleurs dominantes d'une image (mémorisé)
  const extractColorsFromImage = useCallback(async (imageUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve([]);
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Échantillonnage des pixels (tous les 10 pixels pour performance)
          const colors: { [key: string]: number } = {};
          for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Ignorer les pixels transparents ou trop clairs/foncés
            if (a < 128) continue;
            const brightness = (r + g + b) / 3;
            if (brightness < 30 || brightness > 225) continue;
            
            // Quantifier les couleurs (arrondir à des valeurs de 10)
            const qr = Math.round(r / 10) * 10;
            const qg = Math.round(g / 10) * 10;
            const qb = Math.round(b / 10) * 10;
            const key = `${qr},${qg},${qb}`;
            colors[key] = (colors[key] || 0) + 1;
          }
          
          // Trier par fréquence et prendre les 3 plus fréquentes
          const sorted = Object.entries(colors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key]) => {
              const [r, g, b] = key.split(',').map(Number);
              return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
            });
          
          resolve(sorted);
        } catch (error) {
          console.warn('Erreur lors de l\'extraction des couleurs:', error);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imageUrl;
    });
  }, [adjustColorBrightness]);

  // Validation croisée : vérifier que les domaines email correspondent
  const validateEmailDomains = useCallback(() => {
    const orgEmail = organizationForm.getValues().email;
    const smtpEmail = emailForm.getValues().fromEmail;
    
    if (orgEmail && smtpEmail) {
      const orgDomain = getEmailDomain(orgEmail);
      const smtpDomain = getEmailDomain(smtpEmail);
      
      if (orgDomain && smtpDomain && orgDomain !== smtpDomain) {
        // Avertissement mais pas d'erreur bloquante
        toast({
          title: "Attention : Domaines différents",
          description: `L'email de l'organisation (${orgDomain}) et l'email SMTP (${smtpDomain}) ont des domaines différents. Assurez-vous que c'est intentionnel.`,
          variant: "default",
        });
      }
    }
  }, [organizationForm, emailForm, getEmailDomain, toast]);

  const handleEmailSubmit = (data: EmailConfigFormValues) => {
    // Valider les domaines avant de sauvegarder
    validateEmailDomains();
    saveEmailMutation.mutate(data);
    goToNextStep();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "Le logo ne doit pas dépasser 5MB. Veuillez choisir un fichier plus petit.",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    // Validation du type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Veuillez choisir un fichier JPG, PNG ou WebP.",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    // Validation et compression de l'image
    const img = new Image();
    img.onload = async () => {
      const maxWidth = 2000;
      const maxHeight = 2000;
      
      // Compresser l'image si nécessaire
      let processedFile = file;
      if (file.size > 500 * 1024 || img.width > maxWidth || img.height > maxHeight) {
        try {
          toast({
            title: "Compression en cours...",
            description: "Optimisation de l'image pour réduire sa taille.",
          });
          
          processedFile = await compressImage(file, maxWidth, maxHeight, 0.85);
          
          const sizeReduction = ((file.size - processedFile.size) / file.size * 100).toFixed(1);
          if (parseFloat(sizeReduction) > 10) {
            toast({
              title: "Image compressée",
              description: `Taille réduite de ${sizeReduction}% pour optimiser les performances.`,
            });
          }
        } catch (error) {
          console.warn('Erreur lors de la compression:', error);
          // Continuer avec le fichier original si la compression échoue
        }
      }
      
      // Si tout est OK, continuer
      setLogoFile(processedFile);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const preview = reader.result as string;
        setLogoPreview(preview);
        
        // Extraire les couleurs dominantes et suggérer des couleurs
        try {
          const dominantColors = await extractColorsFromImage(preview);
          if (dominantColors.length > 0) {
            // Suggérer la première couleur dominante comme couleur principale
            const suggestedPrimary = dominantColors[0];
            const suggestedDark = adjustColorBrightness(suggestedPrimary, -20);
            const suggestedLight = adjustColorBrightness(suggestedPrimary, 20);
            
            // Mettre à jour les couleurs si elles sont encore aux valeurs par défaut
            const currentColors = colorsForm.getValues();
            if (currentColors.primary === brandingCore.colors.primary) {
              colorsForm.setValue('primary', suggestedPrimary);
              colorsForm.setValue('primaryDark', suggestedDark);
              colorsForm.setValue('primaryLight', suggestedLight);
              
              toast({
                title: "Couleurs suggérées",
                description: "Des couleurs ont été suggérées basées sur votre logo. Vous pouvez les modifier si nécessaire.",
              });
            }
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn('Impossible d\'extraire les couleurs du logo:', error);
          }
        }
      };
      reader.readAsDataURL(processedFile);
    };
    img.onerror = () => {
      toast({
        title: "Fichier invalide",
        description: "Impossible de lire le fichier. Veuillez choisir une image valide.",
        variant: "destructive",
      });
      e.target.value = '';
    };
    img.src = URL.createObjectURL(file);
  };

  // Mutation pour uploader le logo
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      
      const res = await fetch("/api/setup/upload-logo", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Échec de l\'upload');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Logo uploadé avec succès" });
      setLogoUploaded(true);
      setCompletedSteps(prev => {
        const newSteps = [...prev];
        if (!newSteps.includes('logo')) newSteps.push('logo');
        return newSteps;
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'uploader le logo",
        variant: "destructive",
      });
    },
  });

  // Mutation pour tester la configuration email
  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/setup/test-email", { email });
      const data = await response.json() as { success: boolean; message?: string };
      return data;
    },
    onSuccess: (data) => {
      setEmailTestResult({ success: true, message: data.message || "Email de test envoyé avec succès" });
      toast({ 
        title: "Test réussi", 
        description: "L'email de test a été envoyé avec succès. Vérifiez votre boîte de réception."
      });
    },
    onError: (error: any) => {
      setEmailTestResult({ 
        success: false, 
        message: error.message || "Erreur lors de l'envoi de l'email de test" 
      });
      toast({
        title: "Test échoué",
        description: error.message || "Impossible d'envoyer l'email de test",
        variant: "destructive",
      });
    },
  });

  // Mutation pour créer le premier admin
  const createAdminMutation = useMutation({
    mutationFn: async (data: typeof adminForm) => {
      if (data.password !== data.confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }
      
      return await apiRequest("POST", "/api/setup/create-admin", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
    },
    onSuccess: () => {
      toast({ title: "Compte administrateur créé avec succès" });
      setCompletedSteps(prev => {
        const newSteps = [...prev];
        if (!newSteps.includes('admin')) newSteps.push('admin');
        return newSteps;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/setup/status"] });
      goToNextStep();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte administrateur",
        variant: "destructive",
      });
    },
  });

  // Mutation pour générer les fichiers statiques
  const generateConfigMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/setup/generate-config", {});
      const data = await response.json() as { success: boolean; message?: string };
      return data;
    },
    onSuccess: () => {
      toast({ 
        title: "Fichiers statiques générés",
        description: "Les fichiers index.html et manifest.json ont été mis à jour."
      });
    },
    onError: (error: any) => {
      // Ne pas bloquer la finalisation si la génération échoue
      if (import.meta.env.DEV) {
        console.warn('Génération des fichiers statiques échouée:', error);
      }
    },
  });

  const handleFinish = async () => {
    // Enregistrer le temps total de l'onboarding
    const totalTime = Date.now() - performanceMetrics.current.startTime;
    
    // Enregistrer le temps passé sur la dernière étape
    if (performanceMetrics.current.stepTimes[currentStep]) {
      performanceMetrics.current.stepTimes[currentStep].end = Date.now();
    }
    
    // Enregistrer les métriques dans localStorage pour analyse (optionnel, en dev uniquement)
    if (import.meta.env.DEV) {
      const metrics = {
        totalTime,
        stepTimes: performanceMetrics.current.stepTimes,
        errors: performanceMetrics.current.errors,
        apiCalls: performanceMetrics.current.apiCalls,
        apiErrors: performanceMetrics.current.apiErrors,
        apiSuccesses: performanceMetrics.current.apiSuccesses,
        successRate: performanceMetrics.current.apiCalls > 0 
          ? (performanceMetrics.current.apiSuccesses / performanceMetrics.current.apiCalls * 100).toFixed(2) + '%'
          : 'N/A',
      };
      localStorage.setItem('onboarding_metrics', JSON.stringify(metrics));
    }
    
    // Générer les fichiers statiques avant de finaliser
    try {
      await generateConfigMutation.mutateAsync();
    } catch (error) {
      // Ne pas bloquer la finalisation si la génération échoue
      logError('summary', error instanceof Error ? error.message : 'Erreur génération config');
      if (import.meta.env.DEV) {
        console.warn('Génération des fichiers statiques échouée:', error);
      }
    }
    
    // Nettoyer la progression sauvegardée
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Impossible de nettoyer la progression:', error);
      }
    }
    
    toast({ 
      title: "Configuration terminée !",
      description: "Votre application est maintenant personnalisée."
    });
    queryClient.invalidateQueries({ queryKey: ["/api/setup/status"] });
    setTimeout(() => {
      setLocation("/");
    }, 1500);
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8" style={{ scrollBehavior: 'smooth' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Configuration initiale
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Personnalisez votre application en quelques étapes simples
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between mt-2 mb-4">
            <span className="text-xs text-gray-500">
              Étape {currentStepIndex + 1} sur {STEPS.length}
            </span>
            <span className="text-xs text-gray-500">
              💡 Astuce : Utilisez les flèches ← → pour naviguer
            </span>
          </div>
          <div className="flex justify-between mt-4 gap-1 sm:gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const isPast = index < currentStepIndex;
              const stepCompletion = getStepCompletion(step.id);
              
              return (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center flex-1 min-w-0"
                  role="progressbar"
                  aria-label={`Étape ${index + 1}: ${step.label}`}
                  aria-valuenow={stepCompletion}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="relative">
                    <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${
                      isCompleted || isPast
                        ? 'bg-cjd-green border-cjd-green text-white'
                        : isCurrent
                        ? 'border-cjd-green text-cjd-green bg-green-50'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted || isPast ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    {/* Indicateur de progression pour l'étape courante */}
                    {isCurrent && stepCompletion > 0 && stepCompletion < 100 && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 sm:w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cjd-green transition-all duration-300"
                          style={{ width: `${stepCompletion}%` }}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  <span className={`mt-2 text-xs text-center max-w-[60px] sm:max-w-[80px] truncate ${
                    isCurrent ? 'font-semibold text-cjd-green' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {/* Pourcentage de complétion pour l'étape courante */}
                  {isCurrent && stepCompletion < 100 && (
                    <span className="text-xs text-gray-400 mt-1" aria-label={`${Math.round(stepCompletion)}% complété`}>
                      {Math.round(stepCompletion)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const step = STEPS.find(s => s.id === currentStep);
                const Icon = step?.icon || Building2;
                return <Icon className="w-5 h-5 text-cjd-green" />;
              })()}
              {STEPS.find(s => s.id === currentStep)?.label}
            </CardTitle>
            <CardDescription>
              {currentStep === 'organization' && "Configurez les informations de base de votre organisation"}
              {currentStep === 'colors' && "Choisissez les couleurs de votre application"}
              {currentStep === 'email' && "Configurez le serveur SMTP pour l'envoi d'emails"}
              {currentStep === 'logo' && "Téléchargez le logo de votre organisation (optionnel)"}
              {currentStep === 'admin' && "Créez le compte administrateur principal"}
              {currentStep === 'summary' && "Vérifiez votre configuration avant de finaliser"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Animation de transition */}
            <div 
              className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
            >
              {/* Étape 1: Organisation */}
              {currentStep === 'organization' && (
                <Form {...organizationForm}>
                  <form onSubmit={organizationForm.handleSubmit(handleOrganizationSubmit)} className="space-y-4">
                  <FormField
                    control={organizationForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Nom de l'organisation
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Nom court qui apparaîtra dans le header de l'application</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Mon Organisation"
                            className={organizationForm.formState.errors.name ? 'border-red-500 focus-visible:ring-red-500' : field.value && field.value.length >= 2 ? 'border-green-500 focus-visible:ring-green-500' : ''}
                          />
                        </FormControl>
                        {organizationForm.formState.errors.name && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {organizationForm.formState.errors.name.message}
                          </p>
                        )}
                        {!organizationForm.formState.errors.name && field.value && field.value.length >= 2 && (
                          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Nom valide
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={organizationForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Mon Organisation - Description complète" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={organizationForm.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slogan / Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Application collaborative pour..." rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={organizationForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          URL du site web (optionnel)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">URL complète avec http:// ou https:// (ex: https://mon-organisation.com)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="url" placeholder="https://mon-organisation.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={organizationForm.control}
                    name="email"
                    render={({ field }) => {
                      const orgEmail = field.value;
                      const smtpEmail = emailForm.watch('fromEmail');
                      const orgDomain = orgEmail ? getEmailDomain(orgEmail) : null;
                      const smtpDomain = smtpEmail ? getEmailDomain(smtpEmail) : null;
                      const domainsMatch = orgDomain && smtpDomain && orgDomain === smtpDomain;
                      
                      return (
                        <FormItem>
                          <FormLabel>Email de contact</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email" 
                              placeholder="contact@mon-organisation.com"
                              aria-label="Email de contact de l'organisation"
                              className={
                                organizationForm.formState.errors.email 
                                  ? 'border-red-500 focus-visible:ring-red-500' 
                                  : field.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)
                                  ? 'border-green-500 focus-visible:ring-green-500'
                                  : ''
                              }
                              onBlur={() => {
                                field.onBlur();
                                if (smtpEmail) validateEmailDomains();
                              }}
                            />
                          </FormControl>
                          {organizationForm.formState.errors.email && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              {organizationForm.formState.errors.email.message}
                            </p>
                          )}
                          {!organizationForm.formState.errors.email && field.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value) && (
                            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Email valide
                            </p>
                          )}
                          {orgEmail && smtpEmail && !domainsMatch && (
                            <FormDescription className="text-amber-600 flex items-center gap-1 mt-1">
                              <AlertCircle className="h-4 w-4" />
                              Le domaine de cet email ({orgDomain}) diffère de l'email SMTP ({smtpDomain})
                            </FormDescription>
                          )}
                          {orgEmail && smtpEmail && domainsMatch && (
                            <FormDescription className="text-green-600 flex items-center gap-1 mt-1">
                              <CheckCircle className="h-4 w-4" />
                              Les domaines correspondent
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToNextStep}
                    className="w-full sm:w-auto transition-all duration-200 hover:scale-105 active:scale-95"
                    aria-label="Passer cette étape"
                  >
                    Passer cette étape
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveBrandingMutation.isPending}
                    className="w-full sm:w-auto transition-all duration-200 hover:scale-105 active:scale-95"
                    aria-label="Continuer vers l'étape suivante"
                  >
                      {saveBrandingMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          Continuer
                          <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </div>
                  </form>
                </Form>
              )}

              {/* Étape 2: Couleurs */}
              {currentStep === 'colors' && (
                <Form {...colorsForm}>
                  <form onSubmit={colorsForm.handleSubmit(handleColorsSubmit)} className="space-y-4">
                    {/* Prévisualisation en temps réel */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-sm mb-3">Aperçu en temps réel</h4>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex flex-col items-center gap-2">
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: colorsForm.watch('primary') }}
                          />
                          <span className="text-xs text-gray-600">Principal</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: colorsForm.watch('primaryDark') }}
                          />
                          <span className="text-xs text-gray-600">Sombre</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: colorsForm.watch('primaryLight') }}
                          />
                          <span className="text-xs text-gray-600">Clair</span>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <div 
                            className="h-16 rounded-lg border-2 border-gray-300 shadow-sm flex items-center justify-center"
                            style={{ backgroundColor: colorsForm.watch('primary') }}
                          >
                            <span 
                              className="text-white font-semibold px-4 py-2 rounded"
                              style={{ backgroundColor: colorsForm.watch('primaryDark') }}
                            >
                              Bouton exemple
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 mt-2 block text-center">Exemple de bouton</span>
                        </div>
                      </div>
                      
                      {/* Validation du contraste */}
                    {(() => {
                      const primary = colorsForm.watch('primary');
                      const primaryDark = colorsForm.watch('primaryDark');
                      const white = '#ffffff';
                      const contrastPrimary = validateContrast(white, primary);
                      const contrastDark = validateContrast(white, primaryDark);
                      
                      return (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                          <h5 className="text-xs font-medium text-gray-700">Accessibilité (WCAG)</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Principal / Blanc:</span>
                              <span className={`font-medium ${
                                contrastPrimary.passesAAA ? 'text-green-600' :
                                contrastPrimary.passesAA ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {contrastPrimary.level} ({contrastPrimary.ratio.toFixed(2)}:1)
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Sombre / Blanc:</span>
                              <span className={`font-medium ${
                                contrastDark.passesAAA ? 'text-green-600' :
                                contrastDark.passesAA ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {contrastDark.level} ({contrastDark.ratio.toFixed(2)}:1)
                              </span>
                            </div>
                          </div>
                          {(!contrastPrimary.passesAA || !contrastDark.passesAA) && (
                            <p className="text-xs text-amber-600 mt-2">
                              ⚠️ Le contraste est faible. Pour une meilleure accessibilité, utilisez des couleurs plus contrastées.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                    </div>

                  <FormField
                    control={colorsForm.control}
                    name="primary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couleur principale</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} type="color" className="w-20 h-10" />
                          </FormControl>
                          <Input 
                            value={field.value} 
                            onChange={(e) => field.onChange(e.target.value)} 
                            placeholder="#00a844"
                            className="flex-1"
                          />
                        </div>
                        <FormDescription>
                          Couleur principale utilisée pour les boutons et les éléments importants. 
                          <span className="block mt-1 text-xs text-gray-500">
                            💡 Astuce : Choisissez une couleur qui correspond à votre logo ou à votre charte graphique
                          </span>
                        </FormDescription>
                        {/* Suggestions de palettes de couleurs */}
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2">Palettes suggérées :</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { name: 'Vert', primary: '#00a844', dark: '#008835', light: '#00c853' },
                              { name: 'Bleu', primary: '#2196F3', dark: '#1976D2', light: '#64B5F6' },
                              { name: 'Rouge', primary: '#F44336', dark: '#D32F2F', light: '#EF5350' },
                              { name: 'Orange', primary: '#FF9800', dark: '#F57C00', light: '#FFB74D' },
                              { name: 'Violet', primary: '#9C27B0', dark: '#7B1FA2', light: '#BA68C8' },
                            ].map((palette) => (
                              <button
                                key={palette.name}
                                type="button"
                                onClick={() => {
                                  colorsForm.setValue('primary', palette.primary);
                                  colorsForm.setValue('primaryDark', palette.dark);
                                  colorsForm.setValue('primaryLight', palette.light);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md hover:border-gray-400 transition-colors text-xs"
                                title={`Appliquer la palette ${palette.name}`}
                              >
                                <div 
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{ backgroundColor: palette.primary }}
                                />
                                {palette.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={colorsForm.control}
                    name="primaryDark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couleur principale (sombre)</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} type="color" className="w-20 h-10" />
                          </FormControl>
                          <Input 
                            value={field.value} 
                            onChange={(e) => field.onChange(e.target.value)} 
                            placeholder="#008835"
                            className="flex-1"
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={colorsForm.control}
                    name="primaryLight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Couleur principale (claire)</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} type="color" className="w-20 h-10" />
                          </FormControl>
                          <Input 
                            value={field.value} 
                            onChange={(e) => field.onChange(e.target.value)} 
                            placeholder="#00c94f"
                            className="flex-1"
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousStep}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Précédent
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToNextStep}
                    >
                      Passer cette étape
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveBrandingMutation.isPending}
                    >
                      {saveBrandingMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          Continuer
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                  </form>
                </Form>
              )}

              {/* Étape 3: Email SMTP */}
              {currentStep === 'email' && (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hôte SMTP</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ssl0.ovh.net" />
                        </FormControl>
                        <FormDescription>
                          Adresse du serveur SMTP (ex: ssl0.ovh.net pour OVH, smtp.gmail.com pour Gmail)
                          <span className="block mt-1 text-xs text-gray-500">
                            💡 Configuration courante : OVH (ssl0.ovh.net:465), Gmail (smtp.gmail.com:587), Outlook (smtp-mail.outlook.com:587)
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port SMTP</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              placeholder="465"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="secure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Connexion sécurisée</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2 pt-2">
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-600">SSL/TLS</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={emailForm.control}
                    name="fromEmail"
                    render={({ field }) => {
                      const smtpEmail = field.value;
                      const orgEmail = organizationForm.watch('email');
                      const orgDomain = orgEmail ? getEmailDomain(orgEmail) : null;
                      const smtpDomain = smtpEmail ? getEmailDomain(smtpEmail) : null;
                      const domainsMatch = orgDomain && smtpDomain && orgDomain === smtpDomain;
                      
                      return (
                        <FormItem>
                          <FormLabel>Email expéditeur</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email" 
                              placeholder="noreply@mon-organisation.com"
                              aria-label="Email expéditeur SMTP"
                              onBlur={() => {
                                field.onBlur();
                                if (orgEmail) validateEmailDomains();
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Adresse email utilisée pour envoyer les emails
                            {orgEmail && smtpEmail && !domainsMatch && (
                              <span className="block mt-1 text-amber-600">
                                ⚠️ Le domaine diffère de l'email de l'organisation ({orgDomain})
                              </span>
                            )}
                            {orgEmail && smtpEmail && domainsMatch && (
                              <span className="block mt-1 text-green-600">
                                ✅ Domaine cohérent avec l'email de l'organisation
                              </span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={emailForm.control}
                    name="fromName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom expéditeur (optionnel)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Mon Organisation" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note :</strong> Les identifiants SMTP (utilisateur et mot de passe) doivent être configurés dans les variables d'environnement <code className="bg-blue-100 px-1 rounded">SMTP_USER</code> et <code className="bg-blue-100 px-1 rounded">SMTP_PASS</code> pour des raisons de sécurité.
                    </p>
                  </div>

                  {/* Test de configuration email */}
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Tester la configuration</h4>
                        <p className="text-xs text-gray-600">
                          Envoyez un email de test pour vérifier que la configuration fonctionne
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="email@exemple.com"
                        value={testEmailAddress}
                        onChange={(e) => {
                          setTestEmailAddress(e.target.value);
                          setEmailTestResult(null);
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (testEmailAddress) {
                            // Sauvegarder d'abord la config, puis tester
                            const emailData = emailForm.getValues();
                            saveEmailMutation.mutate(emailData, {
                              onSuccess: () => {
                                testEmailMutation.mutate(testEmailAddress);
                              },
                              onError: () => {
                                toast({
                                  title: "Erreur",
                                  description: "Veuillez d'abord sauvegarder la configuration",
                                  variant: "destructive",
                                });
                              }
                            });
                          } else {
                            toast({
                              title: "Email requis",
                              description: "Veuillez entrer une adresse email pour le test",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={testEmailMutation.isPending || !testEmailAddress || saveEmailMutation.isPending}
                      >
                        {testEmailMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Tester
                          </>
                        )}
                      </Button>
                    </div>
                    {emailTestResult && (
                      <div className={`flex items-start gap-2 p-3 rounded-lg ${
                        emailTestResult.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        {emailTestResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <p className={`text-sm ${
                          emailTestResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {emailTestResult.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousStep}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Précédent
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToNextStep}
                    >
                      Passer cette étape
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveEmailMutation.isPending}
                    >
                      {saveEmailMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          Continuer
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                  </form>
                </Form>
              )}

              {/* Étape 4: Logo */}
              {currentStep === 'logo' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Téléchargez le logo de votre organisation (optionnel)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                    disabled={uploadLogoMutation.isPending}
                  />
                  <label htmlFor="logo-upload">
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={uploadLogoMutation.isPending}
                      asChild
                    >
                      <span>
                        {uploadLogoMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Upload en cours...
                          </>
                        ) : (
                          "Choisir un fichier"
                        )}
                      </span>
                    </Button>
                  </label>
                  {logoPreview && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Aperçu du logo</p>
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="max-h-32 mx-auto rounded border-2 border-gray-200 p-2 bg-white"
                        />
                      </div>
                      {/* Prévisualisation dans le header */}
                      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <p className="text-xs text-gray-600 mb-2">Aperçu dans le header :</p>
                        <div className="flex items-center gap-3 bg-white p-2 rounded border">
                          <img 
                            src={logoPreview} 
                            alt="Logo" 
                            className="h-8 w-auto object-contain"
                          />
                          <span className="text-sm font-semibold">
                            {organizationForm.getValues().name || brandingCore.organization.name}
                          </span>
                        </div>
                      </div>
                      {!logoUploaded && logoFile && (
                        <Button
                          type="button"
                          onClick={() => uploadLogoMutation.mutate(logoFile)}
                          className="mt-4"
                          disabled={uploadLogoMutation.isPending}
                        >
                          {uploadLogoMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Upload en cours...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Uploader le logo
                            </>
                          )}
                        </Button>
                      )}
                      {logoUploaded && (
                        <div className="mt-4 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Logo uploadé avec succès
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note :</strong> Formats acceptés : JPG, PNG, WebP (max 5MB). Vous pourrez modifier le logo plus tard depuis la page d'administration.
                  </p>
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                  <Button
                    onClick={goToNextStep}
                  >
                    Continuer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
              )}

              {/* Étape 5: Création du compte admin */}
              {currentStep === 'admin' && (
                <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Création du compte administrateur principal</strong><br />
                    Ce compte aura tous les droits d'administration sur l'application.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Prénom</label>
                      <Input
                        value={adminForm.firstName}
                        onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom</label>
                      <Input
                        value={adminForm.lastName}
                        onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                        placeholder="Nom"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      placeholder="admin@mon-organisation.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Mot de passe</label>
                    <Input
                      type="password"
                      value={adminForm.password}
                      onChange={(e) => {
                        setAdminForm({ ...adminForm, password: e.target.value });
                        setPasswordStrength(calculatePasswordStrength(e.target.value));
                      }}
                      placeholder="Minimum 8 caractères"
                      aria-label="Mot de passe du compte administrateur"
                    />
                    {adminForm.password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(passwordStrength.score / 5) * 100} 
                            className="h-2 flex-1"
                            aria-label={`Force du mot de passe: ${passwordStrength.score}/5`}
                          />
                          <span className={`text-xs font-medium ${
                            passwordStrength.score <= 2 ? 'text-red-600' :
                            passwordStrength.score <= 3 ? 'text-orange-600' :
                            passwordStrength.score === 4 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {passwordStrength.score === 0 && 'Très faible'}
                            {passwordStrength.score === 1 && 'Faible'}
                            {passwordStrength.score === 2 && 'Moyen'}
                            {passwordStrength.score === 3 && 'Bon'}
                            {passwordStrength.score === 4 && 'Très bon'}
                            {passwordStrength.score === 5 && 'Excellent'}
                          </span>
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <p className="font-medium mb-1">Ajoutez :</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {passwordStrength.feedback.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
                    <Input
                      type="password"
                      value={adminForm.confirmPassword}
                      onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                      placeholder="Répétez le mot de passe"
                      aria-label="Confirmation du mot de passe"
                    />
                    {adminForm.password && adminForm.confirmPassword && (
                      <div className="mt-1">
                        {adminForm.password === adminForm.confirmPassword ? (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Les mots de passe correspondent
                          </p>
                        ) : (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Les mots de passe ne correspondent pas
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                  <Button
                    onClick={() => createAdminMutation.mutate(adminForm)}
                    disabled={createAdminMutation.isPending || !adminForm.email || !adminForm.password || !adminForm.firstName || !adminForm.lastName}
                  >
                    {createAdminMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        Créer le compte
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
              )}

              {/* Étape 6: Récapitulatif */}
              {currentStep === 'summary' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>✅ Configuration terminée !</strong> Votre application est maintenant personnalisée.
                    </p>
                  </div>

                  {/* Checklist de vérification finale */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-cjd-green" />
                      Vérification finale
                    </h3>
                    <div className="space-y-2">
                    {(() => {
                      const orgValues = organizationForm.getValues();
                      const emailValues = emailForm.getValues();
                      const colorsValues = colorsForm.getValues();
                      
                      const checks = [
                        {
                          id: 'org-name',
                          label: 'Nom de l\'organisation renseigné',
                          valid: !!orgValues.name && orgValues.name.length >= 2,
                        },
                        {
                          id: 'org-email',
                          label: 'Email de contact renseigné',
                          valid: !!orgValues.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgValues.email),
                        },
                        {
                          id: 'colors',
                          label: 'Couleurs personnalisées',
                          valid: colorsValues.primary !== brandingCore.colors.primary,
                        },
                        {
                          id: 'email-config',
                          label: 'Configuration SMTP renseignée',
                          valid: !!emailValues.host && !!emailValues.fromEmail,
                        },
                        {
                          id: 'email-test',
                          label: 'Test email réussi',
                          valid: emailTestResult?.success === true,
                        },
                        {
                          id: 'admin',
                          label: 'Compte administrateur créé',
                          valid: adminForm.email && adminForm.password && adminForm.firstName && adminForm.lastName,
                        },
                        {
                          id: 'logo',
                          label: 'Logo uploadé (optionnel)',
                          valid: logoUploaded || true, // Toujours valide car optionnel
                          optional: true,
                        },
                      ];
                      
                      const allRequiredValid = checks.filter(c => !c.optional).every(c => c.valid);
                      
                      return (
                        <>
                          <div className="space-y-2">
                            {checks.map((check) => (
                              <div key={check.id} className="flex items-center gap-2 text-sm">
                                {check.valid ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                )}
                                <span className={check.valid ? 'text-gray-700' : 'text-gray-500'}>
                                  {check.label}
                                  {check.optional && <span className="text-gray-400 ml-1">(optionnel)</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                          {!allRequiredValid && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-sm text-amber-800">
                                <strong>⚠️ Attention :</strong> Certains éléments requis ne sont pas complétés. Veuillez les compléter avant de finaliser.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                    </div>
                  </div>

                  {/* Prévisualisation globale */}
                  <div className="border-2 border-gray-200 rounded-lg p-6 bg-white">
                    <h3 className="font-semibold text-lg mb-4">Aperçu de votre application</h3>
                    
                    {/* Header simulé */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          className="h-10 w-auto object-contain"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-lg" style={{ color: colorsForm.getValues().primary }}>
                          {organizationForm.getValues().name || brandingCore.organization.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {organizationForm.getValues().tagline || brandingCore.app.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Exemple de bouton avec les couleurs */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Exemple de bouton :</p>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ backgroundColor: colorsForm.getValues().primary }}
                      >
                        Bouton principal
                      </button>
                      <button
                        className="px-4 py-2 rounded text-white font-medium"
                        style={{ backgroundColor: colorsForm.getValues().primaryDark }}
                      >
                        Bouton sombre
                      </button>
                      <button
                        className="px-4 py-2 rounded border-2 font-medium"
                        style={{ 
                          borderColor: colorsForm.getValues().primary,
                          color: colorsForm.getValues().primary
                        }}
                      >
                        Bouton outline
                      </button>
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <strong>Email :</strong> {organizationForm.getValues().email || 'Non configuré'}
                    </p>
                    {organizationForm.getValues().url && (
                      <p className="text-sm text-gray-600">
                        <strong>Site web :</strong> <a href={organizationForm.getValues().url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{organizationForm.getValues().url}</a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Aperçu des couleurs */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Aperçu de votre thème</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: colorsForm.getValues().primary }}
                      />
                      <span className="text-xs text-gray-600">Principal</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: colorsForm.getValues().primaryDark }}
                      />
                      <span className="text-xs text-gray-600">Sombre</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-12 h-12 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: colorsForm.getValues().primaryLight }}
                      />
                      <span className="text-xs text-gray-600">Clair</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Récapitulatif de la configuration</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Organisation</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Nom :</strong> {organizationForm.getValues().name || 'Non configuré'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Nom complet :</strong> {organizationForm.getValues().fullName || 'Non configuré'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Email :</strong> {organizationForm.getValues().email || 'Non configuré'}
                    </p>
                    {organizationForm.getValues().url && (
                      <p className="text-sm text-gray-600">
                        <strong>Site web :</strong> <a href={organizationForm.getValues().url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{organizationForm.getValues().url}</a>
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Couleurs</h4>
                    <div className="flex gap-2 items-center">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: colorsForm.getValues().primary }}
                      />
                      <span className="text-sm text-gray-600">
                        {colorsForm.getValues().primary}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Email SMTP</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Hôte :</strong> {emailForm.getValues().host || 'Non configuré'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Port :</strong> {emailForm.getValues().port || 'Non configuré'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Expéditeur :</strong> {emailForm.getValues().fromEmail || 'Non configuré'}
                    </p>
                    {emailTestResult?.success && (
                      <p className="text-sm text-green-600 mt-2">
                        ✅ Configuration testée avec succès
                      </p>
                    )}
                  </div>

                  {logoUploaded && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Logo</h4>
                      {logoPreview && (
                        <div className="mt-2">
                          <img 
                            src={logoPreview} 
                            alt="Logo" 
                            className="max-h-24 rounded"
                          />
                        </div>
                      )}
                      <p className="text-sm text-green-600 mt-2">
                        ✅ Logo uploadé avec succès
                      </p>
                    </div>
                  )}

                  {adminForm.email && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Compte administrateur</h4>
                      <p className="text-sm text-gray-600">
                        <strong>Nom :</strong> {adminForm.firstName} {adminForm.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Email :</strong> {adminForm.email}
                      </p>
                      <p className="text-sm text-green-600 mt-2">
                        ✅ Compte créé avec succès
                      </p>
                    </div>
                  )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={exportConfiguration}
                        className="text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                      </Button>
                      <label>
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) importConfiguration(file);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          asChild
                          className="text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <span>
                            <FileUp className="h-4 w-4 mr-2" />
                            Importer
                          </span>
                        </Button>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goToPreviousStep}
                        className="transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Précédent
                      </Button>
                      <Button
                        onClick={handleFinish}
                        className="bg-cjd-green hover:bg-cjd-green-dark transition-all duration-200 hover:scale-105 active:scale-95"
                        disabled={generateConfigMutation.isPending}
                      >
                        {generateConfigMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Génération des fichiers...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Terminer la configuration
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Fin de l'animation de transition */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

