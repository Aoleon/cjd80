import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Download, Smartphone, Monitor, Share, Plus } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { getShortAppName } from '@/config/branding';

interface PWAInstallPromptProps {
  variant?: 'banner' | 'modal' | 'card';
  className?: string;
}

export function PWAInstallPrompt({ variant = 'banner', className = '' }: PWAInstallPromptProps) {
  const {
    isInstalled,
    showPrompt,
    installResult,
    operatingSystem,
    browserInfo,
    installInstructions,
    installApp,
    hideInstallPrompt,
    declineInstall,
    isMobile,
    hasPromptEvent
  } = usePWAInstall();

  const [showInstructions, setShowInstructions] = useState(false);

  // Ne pas afficher si déjà installé
  if (isInstalled || !showPrompt) {
    return null;
  }

  const renderInstallButton = () => {
    const isLoading = installResult === 'pending';
    
    if (operatingSystem === 'ios') {
      return (
        <Button
          onClick={() => setShowInstructions(true)}
          disabled={isLoading}
          className="bg-cjd-green hover:bg-cjd-green-dark text-white"
          data-testid="button-install-ios"
        >
          <Share className="w-4 h-4 mr-2" />
          Voir les instructions
        </Button>
      );
    }
    
    return (
      <Button
        onClick={installApp}
        disabled={isLoading || !hasPromptEvent}
        className="bg-cjd-green hover:bg-cjd-green-dark text-white"
        data-testid="button-install-android"
      >
        <Download className="w-4 h-4 mr-2" />
        {isLoading ? 'Installation...' : 'Installer l\'application'}
      </Button>
    );
  };

  const renderContent = () => (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl" data-testid="icon-os">
            {installInstructions.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg" data-testid="text-install-title">
              Installer {getShortAppName()}
            </h3>
            <p className="text-sm text-gray-600" data-testid="text-os-info">
              {operatingSystem === 'ios' ? 'iPhone/iPad' : 
               operatingSystem === 'android' ? 'Android' : 'Ordinateur'} • {browserInfo.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-cjd-green/10 text-cjd-green">
            <Smartphone className="w-3 h-3 mr-1" />
            PWA
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={hideInstallPrompt}
            data-testid="button-close-prompt"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-gray-700 mb-4" data-testid="text-install-benefits">
        Installez l'application pour un accès rapide, des notifications et une meilleure expérience hors ligne.
      </p>

      <div className="flex items-center gap-3">
        {renderInstallButton()}
        
        <Button
          variant="outline"
          onClick={declineInstall}
          data-testid="button-decline-install"
        >
          Plus tard
        </Button>
      </div>

      {installResult === 'error' && (
        <div className="mt-3 p-3 bg-error-light border border-error rounded-md">
          <p className="text-sm text-error-dark" data-testid="text-install-error">
            Erreur lors de l'installation. Veuillez réessayer.
          </p>
        </div>
      )}
    </>
  );

  // Modal avec instructions pour iOS
  const instructionsModal = (
    <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
      <DialogContent className="max-w-md" data-testid="modal-install-instructions">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {installInstructions.icon}
            {installInstructions.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Suivez ces étapes pour installer {getShortAppName()} sur votre appareil :
          </p>
          
          <ol className="space-y-3">
            {installInstructions.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cjd-green text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm" data-testid={`text-step-${index}`}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
          
          <Separator />
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInstructions(false)}
              data-testid="button-close-instructions"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Variantes d'affichage
  if (variant === 'modal') {
    return (
      <>
        <Dialog open={showPrompt} onOpenChange={hideInstallPrompt}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Installer l'application</DialogTitle>
            </DialogHeader>
            {renderContent()}
          </DialogContent>
        </Dialog>
        {instructionsModal}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <Card className={`w-full max-w-md ${className}`} data-testid="card-install-prompt">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-cjd-green" />
              Installer l'application
            </CardTitle>
            <CardDescription>
              Accès rapide et expérience améliorée
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
        {instructionsModal}
      </>
    );
  }

  // Banner par défaut
  return (
    <>
      <div className={`bg-white border-b border-gray-200 p-4 ${className}`} data-testid="banner-install-prompt">
        {renderContent()}
      </div>
      {instructionsModal}
    </>
  );
}

// Composant pour afficher un bouton d'installation dans la barre de navigation
export function PWAInstallButton() {
  const { showInstallPrompt, canInstall, isInstalled } = usePWAInstall();

  if (isInstalled || !canInstall) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={showInstallPrompt}
      className="border-cjd-green text-cjd-green hover:bg-cjd-green hover:text-white"
      data-testid="button-install-nav"
    >
      <Download className="w-4 h-4 mr-2" />
      Installer
    </Button>
  );
}