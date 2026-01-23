'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Error boundary pour les routes protégées
 * Catch les erreurs et affiche une interface utilisateur friendly
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur pour le monitoring
    console.error('Protected route error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-error-light p-4">
            <AlertCircle className="h-12 w-12 text-error" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Oups ! Une erreur est survenue
          </h1>
          <p className="text-muted-foreground">
            Désolé, quelque chose s'est mal passé. Nous avons été notifiés et travaillons
            à résoudre le problème.
          </p>
        </div>

        {error.message && (
          <div className="bg-error-light border border-error/20 rounded-lg p-4">
            <p className="text-sm text-error-dark font-mono">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-error/60 mt-2">
                ID d'erreur: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>

          <Button
            asChild
            variant="outline"
            className="gap-2"
          >
            <Link href="/admin/dashboard">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Si le problème persiste, veuillez contacter le support technique.
          </p>
        </div>
      </div>
    </div>
  );
}
