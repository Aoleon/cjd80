import { useState, useEffect } from "react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { useFeatureConfig } from "@/contexts/FeatureConfigContext";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Lightbulb, Calendar, Package, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getShortAppName } from '@/config/branding';

interface Feature {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    key: 'ideas',
    label: 'Boîte à idées',
    description: 'Permet aux membres de proposer et voter pour des idées',
    icon: <Lightbulb className="w-5 h-5 text-cjd-green" />,
  },
  {
    key: 'events',
    label: 'Événements',
    description: 'Gestion des événements et inscriptions',
    icon: <Calendar className="w-5 h-5 text-cjd-green" />,
  },
  {
    key: 'loan',
    label: 'Prêt de matériel',
    description: 'Système de prêt de matériel entre membres',
    icon: <Package className="w-5 h-5 text-cjd-green" />,
  },
];

export default function AdminFeaturesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { features: featureStates, isLoading: configLoading, isFeatureEnabled, updateFeature, isUpdating } = useFeatureConfig();
  const { toast } = useToast();
  const isSuperAdmin = user && hasPermission(user.role, 'admin.manage');

  // Initialiser les états locaux depuis la config
  const [localStates, setLocalStates] = useState<Record<string, boolean>>(() => {
    const states: Record<string, boolean> = {};
    features.forEach(f => {
      states[f.key] = isFeatureEnabled(f.key);
    });
    return states;
  });

  // Mettre à jour les états locaux quand la config change
  useEffect(() => {
    const states: Record<string, boolean> = {};
    features.forEach(f => {
      states[f.key] = isFeatureEnabled(f.key);
    });
    setLocalStates(states);
  }, [isFeatureEnabled]); // featureStates est déjà utilisé via isFeatureEnabled

  const handleToggle = async (featureKey: string, enabled: boolean) => {
    if (!isSuperAdmin) {
      toast({
        title: "Permission refusée",
        description: "Seuls les super administrateurs peuvent modifier les fonctionnalités",
        variant: "destructive",
      });
      return;
    }

    // Mettre à jour l'état local immédiatement pour un feedback instantané
    setLocalStates(prev => ({ ...prev, [featureKey]: enabled }));

    try {
      await updateFeature(featureKey, enabled);
      toast({
        title: "Fonctionnalité mise à jour",
        description: `La fonctionnalité "${features.find(f => f.key === featureKey)?.label}" a été ${enabled ? 'activée' : 'désactivée'}`,
      });
    } catch (error: any) {
      // Revenir à l'état précédent en cas d'erreur
      setLocalStates(prev => ({ ...prev, [featureKey]: !enabled }));
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la fonctionnalité",
        variant: "destructive",
      });
    }
  };

  if (authLoading || configLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-cjd-green text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold">{getShortAppName()}</h1>
                <p className="text-white/90">Administration - Fonctionnalités</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Veuillez vous connecter pour accéder à l'administration.</p>
        </main>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <AdminPageLayout
        title="Fonctionnalités"
        description="Gérer l'activation des fonctionnalités de la plateforme"
        breadcrumbs={[
          { label: "Paramètres", path: "/admin/settings" },
          { label: "Fonctionnalités" },
        ]}
        icon={<Settings className="w-5 h-5 text-cjd-green" />}
        showCard={true}
      >
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-error" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Accès refusé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Seuls les super administrateurs peuvent gérer les fonctionnalités.
            </p>
          </div>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Fonctionnalités"
      description="Activer ou désactiver les fonctionnalités de la plateforme"
      breadcrumbs={[
        { label: "Paramètres", path: "/admin/settings" },
        { label: "Fonctionnalités" },
      ]}
      icon={<Settings className="w-5 h-5 text-cjd-green" />}
      showCard={false}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Fonctionnalités</CardTitle>
            <CardDescription>
              Activez ou désactivez les fonctionnalités principales de la plateforme. 
              Les fonctionnalités désactivées ne seront plus accessibles aux utilisateurs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {features.map((feature) => {
              const enabled = localStates[feature.key] ?? isFeatureEnabled(feature.key);
              
              return (
                <div
                  key={feature.key}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`feature-${feature.key}`} className="text-base font-semibold cursor-pointer">
                        {feature.label}
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${enabled ? 'text-success' : 'text-gray-500'}`}>
                      {enabled ? 'Activée' : 'Désactivée'}
                    </span>
                    <Switch
                      id={`feature-${feature.key}`}
                      checked={enabled}
                      onCheckedChange={(checked) => handleToggle(feature.key, checked)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Note :</strong> La désactivation d'une fonctionnalité masquera immédiatement :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Les liens de navigation correspondants</li>
                <li>Les sections dans la page d'accueil</li>
                <li>Les routes d'accès direct</li>
                <li>Les pages d'administration correspondantes</li>
              </ul>
              <p className="mt-4">
                Les données existantes ne sont pas supprimées et seront à nouveau accessibles si vous réactivez la fonctionnalité.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}

