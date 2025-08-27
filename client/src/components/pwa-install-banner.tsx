import { useState, useEffect } from 'react';
import { X, Download, Bell, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '@/hooks/use-pwa-install';

const BENEFITS = [
  { icon: Bell, text: 'Notifications instantanées', color: 'text-blue-500' },
  { icon: Zap, text: 'Accès rapide', color: 'text-yellow-500' },
  { icon: Shield, text: 'Fonctionne hors-ligne', color: 'text-green-500' },
];

export function PWAInstallBanner() {
  const { isInstallable, installApp, operatingSystem, isInstalled, canInstall } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Ne pas afficher si déjà installé
    if (isInstalled) {
      return;
    }

    // Vérifier si l'utilisateur a déjà refusé
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    const lastDismissed = dismissed ? parseInt(dismissed) : 0;
    const daysSinceLastDismiss = (Date.now() - lastDismissed) / (1000 * 60 * 60 * 24);

    // Ne pas afficher si refusé récemment (moins de 7 jours)
    if (daysSinceLastDismiss < 7 && dismissed) {
      return;
    }

    // Vérifier si l'app est installable ou si c'est iOS
    if (!canInstall && operatingSystem !== 'ios') {
      return;
    }

    // Afficher après 30 secondes ou après une interaction significative
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 30000);

    // Détecter les interactions significatives
    const handleInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Afficher après vote, inscription ou proposition d'idée
      if (
        target.closest('[data-testid*="vote"]') ||
        target.closest('[data-testid*="inscription"]') ||
        target.closest('[data-testid*="propose"]')
      ) {
        if (!hasInteracted) {
          setHasInteracted(true);
          setTimeout(() => {
            setShowBanner(true);
          }, 2000);
        }
      }
    };

    document.addEventListener('click', handleInteraction);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleInteraction);
    };
  }, [isInstallable, operatingSystem, hasInteracted, isInstalled, canInstall]);

  const handleInstall = async () => {
    if (operatingSystem === 'ios') {
      // Pour iOS, on ne peut que donner les instructions
      alert(
        'Pour installer sur iOS:\n' +
        '1. Appuyez sur le bouton Partager (carré avec flèche)\n' +
        '2. Sélectionnez "Sur l\'écran d\'accueil"\n' +
        '3. Appuyez sur "Ajouter"'
      );
    } else {
      await installApp();
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    // Déclencher un événement pour informer le bouton flottant
    window.dispatchEvent(new CustomEvent('pwa-banner-dismissed'));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
              data-testid="button-dismiss-banner"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Installer l'application
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Accédez plus rapidement à vos idées
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {BENEFITS.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <benefit.icon className={`h-4 w-4 ${benefit.color}`} />
                    <span className="text-sm">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1"
                  data-testid="button-install-now"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {operatingSystem === 'ios' ? 'Voir comment installer' : 'Installer maintenant'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-muted-foreground"
                  data-testid="button-later"
                >
                  Plus tard
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}