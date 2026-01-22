"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFeatureConfig } from "@/contexts/FeatureConfigContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

interface FeatureGuardProps {
  featureKey: string;
  children: ReactNode;
  featureName?: string;
}

/**
 * Composant de garde pour protéger les routes des fonctionnalités désactivées
 * Redirige vers la page d'accueil si la fonctionnalité est désactivée
 */
export default function FeatureGuard({ featureKey, children, featureName }: FeatureGuardProps) {
  const { isFeatureEnabled, isLoading } = useFeatureConfig();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cjd-green"></div>
      </div>
    );
  }

  if (!isFeatureEnabled(featureKey)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-error" />
              <CardTitle>Fonctionnalité indisponible</CardTitle>
            </div>
            <CardDescription>
              {featureName || "Cette fonctionnalité"} est actuellement désactivée.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Cette fonctionnalité a été temporairement désactivée par l'administrateur.
              Veuillez contacter l'administration si vous avez des questions.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

