import { useState, useEffect } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { offlineQueue } from "@/lib/offline-queue";
import { syncQueuedActions } from "@/lib/sync-service";

export default function OfflineStatusBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [actionCount, setActionCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      console.log('[OfflineStatusBanner] Connection restored');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[OfflineStatusBanner] Connection lost');
      setIsOnline(false);
    };

    const handleSyncComplete = (event: Event) => {
      const customEvent = event as CustomEvent<{ synced: number; failed: number }>;
      const { synced, failed } = customEvent.detail;
      
      console.log('[OfflineStatusBanner] Sync complete:', { synced, failed });
      
      if (synced > 0) {
        toast({
          title: "Synchronisation réussie",
          description: `${synced} action${synced > 1 ? 's' : ''} synchronisée${synced > 1 ? 's' : ''} avec succès`,
          variant: "default",
        });
      }
      
      updateActionCount();
    };

    const handleSyncFailed = (event: Event) => {
      const customEvent = event as CustomEvent<{ failed: number }>;
      const { failed } = customEvent.detail;
      
      console.log('[OfflineStatusBanner] Sync failed:', { failed });
      
      toast({
        title: "Erreur de synchronisation",
        description: `${failed} action${failed > 1 ? 's' : ''} n'ont pas pu être synchronisée${failed > 1 ? 's' : ''}`,
        variant: "destructive",
      });
      
      updateActionCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('sync-complete', handleSyncComplete);
    window.addEventListener('sync-failed', handleSyncFailed);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync-complete', handleSyncComplete);
      window.removeEventListener('sync-failed', handleSyncFailed);
    };
  }, [toast]);

  useEffect(() => {
    updateActionCount();

    const interval = setInterval(() => {
      updateActionCount();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const updateActionCount = async () => {
    try {
      const count = await offlineQueue.getCount();
      setActionCount(count);
    } catch (error) {
      console.error('[OfflineStatusBanner] Failed to get action count:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "Impossible de synchroniser",
        description: "Vous devez être en ligne pour synchroniser les actions",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);

    try {
      const result = await syncQueuedActions();
      
      if (result.synced > 0) {
        toast({
          title: "Synchronisation réussie",
          description: `${result.synced} action${result.synced > 1 ? 's' : ''} synchronisée${result.synced > 1 ? 's' : ''} avec succès`,
          variant: "default",
        });
      }
      
      if (result.failed > 0) {
        toast({
          title: "Synchronisation partielle",
          description: `${result.failed} action${result.failed > 1 ? 's' : ''} n'ont pas pu être synchronisée${result.failed > 1 ? 's' : ''}`,
          variant: "destructive",
        });
      }
      
      if (result.synced === 0 && result.failed === 0) {
        toast({
          title: "Aucune action à synchroniser",
          description: "Toutes les actions sont déjà synchronisées",
          variant: "default",
        });
      }
      
      await updateActionCount();
    } catch (error) {
      console.error('[OfflineStatusBanner] Sync error:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Une erreur est survenue lors de la synchronisation",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && actionCount === 0) {
    return null;
  }

  const bgColor = !isOnline 
    ? "bg-warning dark:bg-warning-dark" 
    : "bg-info dark:bg-info-dark";
  
  const Icon = isOnline ? Wifi : WifiOff;
  
  const message = !isOnline
    ? `Mode hors ligne - ${actionCount} action${actionCount > 1 ? 's' : ''} en attente`
    : `${actionCount} action${actionCount > 1 ? 's' : ''} en attente de synchronisation`;

  return (
    <div
      data-testid="banner-offline-status"
      className={`fixed top-0 left-0 right-0 z-50 ${bgColor} text-white shadow-lg animate-in slide-in-from-top duration-300`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 flex-shrink-0" data-testid="icon-connection-status" />
            <span className="text-sm font-medium" data-testid="text-status-message">
              {message}
            </span>
          </div>
          
          <Button
            onClick={handleSync}
            disabled={!isOnline || isSyncing || actionCount === 0}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
            data-testid="button-sync-now"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" data-testid="icon-syncing" />
                Synchronisation...
              </>
            ) : (
              "Synchroniser maintenant"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
