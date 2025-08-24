import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, X, Share } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export function PWAFloatingInstall() {
  const {
    isInstalled,
    installResult,
    operatingSystem,
    installInstructions,
    installApp,
    declineInstall,
    isMobile,
    hasPromptEvent
  } = usePWAInstall();

  const [showInstructions, setShowInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Vérifier si on a déjà refusé l'installation
  const hasDeclined = localStorage.getItem('pwa-install-declined');

  // Ne pas afficher si :
  // - Déjà installé
  // - Pas sur mobile
  // - Utilisateur a fermé le bouton
  // - Utilisateur a déjà refusé
  if (isInstalled || !isMobile || isDismissed || hasDeclined) {
    return null;
  }

  const handleInstall = () => {
    if (operatingSystem === 'ios') {
      setShowInstructions(true);
    } else {
      installApp();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    declineInstall();
  };

  return (
    <>
      {/* Bouton flottant */}
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-500">
        <div className="relative">
          {/* Bouton de fermeture */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            data-testid="button-dismiss-floating"
          >
            <X className="w-3 h-3 text-gray-600" />
          </button>
          
          {/* Bouton d'installation */}
          <Button
            onClick={handleInstall}
            disabled={installResult === 'pending'}
            className="bg-cjd-green hover:bg-green-600 text-white shadow-lg rounded-full px-6 py-6 flex items-center gap-3"
            data-testid="button-install-floating"
          >
            {operatingSystem === 'ios' ? (
              <>
                <Share className="w-5 h-5" />
                <span className="font-medium">Installer l'app</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span className="font-medium">
                  {installResult === 'pending' ? 'Installation...' : 'Installer l\'app'}
                </span>
              </>
            )}
          </Button>
          
          {/* Effet de pulsation pour attirer l'attention */}
          <div className="absolute inset-0 rounded-full bg-cjd-green animate-ping opacity-25 pointer-events-none" />
        </div>
      </div>

      {/* Modal avec instructions pour iOS */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-md mx-4" data-testid="modal-ios-instructions">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {installInstructions.icon}
              Installation sur iOS
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Pour installer CJD Amiens sur votre iPhone/iPad :
            </p>
            
            <ol className="space-y-3">
              {installInstructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-cjd-green text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm" data-testid={`text-ios-step-${index}`}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInstructions(false);
                  handleDismiss();
                }}
                data-testid="button-close-ios-instructions"
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}