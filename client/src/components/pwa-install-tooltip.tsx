import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export function PWAInstallTooltip() {
  const { isInstallable, canInstall, operatingSystem, isInstalled } = usePWAInstall();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Ne pas afficher si déjà installé ou non installable
    if (isInstalled || !canInstall) {
      return;
    }

    // Vérifier si déjà affiché
    const hasSeenTooltip = localStorage.getItem('pwa-tooltip-seen');
    if (hasSeenTooltip) {
      return;
    }

    // Afficher après 60 secondes de navigation
    const timer = setTimeout(() => {
      setShowTooltip(true);
      localStorage.setItem('pwa-tooltip-seen', 'true');
    }, 60000);

    return () => clearTimeout(timer);
  }, [isInstalled, canInstall]);

  if (!showTooltip) return null;

  const getInstallTip = () => {
    switch (operatingSystem) {
      case 'ios':
        return 'Astuce : Ajoutez cette app à votre écran d\'accueil pour un accès rapide ! Appuyez sur Partager puis "Sur l\'écran d\'accueil"';
      case 'android':
        return 'Astuce : Installez l\'app pour recevoir des notifications et y accéder rapidement depuis votre écran d\'accueil !';
      default:
        return 'Astuce : Installez l\'application pour un accès rapide et des notifications instantanées !';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-20 right-4 z-40 rounded-full bg-primary/10 hover:bg-primary/20"
            onClick={() => setShowTooltip(false)}
            data-testid="button-tooltip-info"
          >
            <Info className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs p-3">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-1 right-1 p-0.5 rounded-full hover:bg-muted"
            data-testid="button-close-tooltip"
          >
            <X className="h-3 w-3" />
          </button>
          <p className="text-sm pr-4">{getInstallTip()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}