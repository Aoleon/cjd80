import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/use-pwa';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  RefreshCw, 
  Share2, 
  Wifi, 
  WifiOff, 
  Smartphone,
  X
} from 'lucide-react';

export function PWAControls() {
  const [showControls, setShowControls] = useState(false);
  const { toast } = useToast();
  const {
    isInstallable,
    isInstalled,
    isOffline,
    installApp,
    updateAvailable,
    updateApp,
    shareApp
  } = usePWA();

  const handleInstall = async () => {
    try {
      await installApp();
      toast({
        title: "Application installée !",
        description: "CJD Amiens est maintenant disponible sur votre appareil",
      });
    } catch (error) {
      toast({
        title: "Erreur d'installation",
        description: "Impossible d'installer l'application",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = () => {
    updateApp();
    toast({
      title: "Mise à jour appliquée",
      description: "L'application va redémarrer",
    });
  };

  const handleShare = async () => {
    try {
      await shareApp();
      toast({
        title: "Partage effectué",
        description: "Lien partagé avec succès",
      });
    } catch (error) {
      toast({
        title: "Partage impossible",
        description: "Le lien a été copié dans le presse-papier",
      });
    }
  };

  // Bouton flottant PWA principal
  if (!showControls) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowControls(true)}
          className="rounded-full w-12 h-12 bg-cjd-green hover:bg-cjd-green-dark shadow-lg"
          size="sm"
        >
          <Smartphone className="w-5 h-5" />
        </Button>
        
        {/* Badges de notification */}
        <div className="absolute -top-2 -right-2 flex flex-col gap-1">
          {isOffline && (
            <Badge variant="destructive" className="rounded-full w-6 h-6 p-0 flex items-center justify-center">
              <WifiOff className="w-3 h-3" />
            </Badge>
          )}
          {updateAvailable && (
            <Badge variant="default" className="rounded-full w-6 h-6 p-0 flex items-center justify-center bg-orange-500">
              <RefreshCw className="w-3 h-3" />
            </Badge>
          )}
          {isInstallable && (
            <Badge variant="default" className="rounded-full w-6 h-6 p-0 flex items-center justify-center bg-blue-500">
              <Download className="w-3 h-3" />
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Panel PWA complet
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-xl border-cjd-green/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cjd-green" />
              Application PWA
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Statut de connexion */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm">
              {isOffline ? (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">Mode hors ligne</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Connecté</span>
                </>
              )}
            </div>
          </div>

          {/* Actions PWA */}
          <div className="space-y-3">
            {isInstallable && (
              <Button
                onClick={handleInstall}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Installer l'application
              </Button>
            )}

            {updateAvailable && (
              <Button
                onClick={handleUpdate}
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Mettre à jour
              </Button>
            )}

            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager l'app
            </Button>
          </div>

          {/* Informations */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={isInstalled ? 'text-green-600' : 'text-gray-500'}>
                  {isInstalled ? 'Installée' : 'Web'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cache:</span>
                <span className="text-green-600">Actif</span>
              </div>
              <div className="flex justify-between">
                <span>Offline:</span>
                <span className="text-green-600">Supporté</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}