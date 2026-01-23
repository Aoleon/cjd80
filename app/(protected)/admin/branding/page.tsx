'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering to prevent SSR prerendering issues with hooks
export const dynamic = 'force-dynamic';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Palette, RotateCcw } from 'lucide-react';

/**
 * Page Configuration Branding
 * Permet de personnaliser les couleurs et textes de l'application
 */
export default function AdminBrandingPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);

  // Charger la configuration branding
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch('/api/branding/config');
        if (!response.ok) throw new Error('Erreur de chargement');
        const data = await response.json();

        // Parser la config si c'est une string JSON
        const parsedConfig = typeof data.config === 'string'
          ? JSON.parse(data.config)
          : data.config;

        setConfig(parsedConfig);
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de charger la configuration',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranding();
  }, [toast]);

  // Sauvegarder la configuration
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/branding/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: JSON.stringify(config),
        }),
      });

      if (!response.ok) throw new Error('Erreur de sauvegarde');

      toast({
        title: 'Configuration sauvegardée',
        description: 'Les modifications ont été enregistrées avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Réinitialiser aux valeurs par défaut
  const handleReset = () => {
    if (confirm('Réinitialiser aux valeurs par défaut ?')) {
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
            <CardDescription>Configuration introuvable</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration Branding</h1>
          <p className="text-muted-foreground">
            Personnalisez l'apparence de l'application
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Informations générales
            </CardTitle>
            <CardDescription>
              Nom et description de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l'application</label>
              <Input
                value={config.appName || ''}
                onChange={(e) =>
                  setConfig({ ...config, appName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l'association</label>
              <Input
                value={config.associationName || ''}
                onChange={(e) =>
                  setConfig({ ...config, associationName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={config.description || ''}
                onChange={(e) =>
                  setConfig({ ...config, description: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Couleurs */}
        <Card>
          <CardHeader>
            <CardTitle>Couleurs du thème</CardTitle>
            <CardDescription>
              Personnalisez les couleurs principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Couleur primaire</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.colors?.primary || '#000000'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      colors: { ...config.colors, primary: e.target.value },
                    })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={config.colors?.primary || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      colors: { ...config.colors, primary: e.target.value },
                    })
                  }
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Couleur secondaire</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.colors?.secondary || '#666666'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      colors: { ...config.colors, secondary: e.target.value },
                    })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={config.colors?.secondary || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      colors: { ...config.colors, secondary: e.target.value },
                    })
                  }
                  placeholder="#666666"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Couleur accent</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.colors?.accent || '#0066cc'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      colors: { ...config.colors, accent: e.target.value },
                    })
                  }
                  className="w-20 h-10"
                />
                <Input
                  value={config.colors?.accent || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      colors: { ...config.colors, accent: e.target.value },
                    })
                  }
                  placeholder="#0066cc"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prévisualisation */}
      <Card>
        <CardHeader>
          <CardTitle>Prévisualisation</CardTitle>
          <CardDescription>
            Aperçu des modifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-lg border space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: config.colors?.primary }}>
              {config.appName || 'Nom de l\'application'}
            </h2>
            <p className="text-muted-foreground">
              {config.description || 'Description de l\'application'}
            </p>
            <div className="flex gap-2">
              <Button style={{ backgroundColor: config.colors?.primary }}>
                Bouton primaire
              </Button>
              <Button
                variant="outline"
                style={{ borderColor: config.colors?.accent, color: config.colors?.accent }}
              >
                Bouton accent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
