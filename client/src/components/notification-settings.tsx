import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Check, X, TestTube } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className = '' }: NotificationSettingsProps) {
  const {
    permission,
    isSubscribed,
    isSupported,
    canSubscribe,
    needsPermission,
    hasPermission,
    requestPermission,
    subscribe,
    unsubscribe,
    testNotification
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);

  const handleToggleNotifications = async () => {
    setIsLoading(true);
    
    try {
      if (!isSubscribed) {
        // S'abonner aux notifications
        const success = await subscribe();
        if (!success) {
          console.error('Échec de l\'abonnement aux notifications');
        }
      } else {
        // Se désabonner
        const success = await unsubscribe();
        if (!success) {
          console.error('Échec du désabonnement');
        }
      }
    } catch (error) {
      console.error('Erreur toggle notifications:', error);
    }
    
    setIsLoading(false);
  };

  const handleRequestPermission = async () => {
    setIsLoading(true);
    await requestPermission();
    setIsLoading(false);
  };

  const handleTestNotification = async () => {
    await testNotification();
  };

  if (!isSupported) {
    return (
      <Card className={className} data-testid="card-notifications-unsupported">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5 text-gray-400" />
            Notifications non supportées
          </CardTitle>
          <CardDescription>
            Votre navigateur ne supporte pas les notifications push
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (permission === 'denied') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <X className="w-3 h-3" />
          Refusées
        </Badge>
      );
    }
    
    if (isSubscribed) {
      return (
        <Badge variant="default" className="bg-cjd-green flex items-center gap-1">
          <Check className="w-3 h-3" />
          Actives
        </Badge>
      );
    }
    
    if (hasPermission) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Bell className="w-3 h-3" />
          Disponibles
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Bell className="w-3 h-3" />
        En attente
      </Badge>
    );
  };

  return (
    <Card className={className} data-testid="card-notification-settings">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cjd-green" />
            Notifications
          </span>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Recevez des notifications pour les nouvelles idées et événements
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {permission === 'denied' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700" data-testid="text-permission-denied">
              Les notifications ont été refusées. Vous pouvez les réactiver dans les paramètres de votre navigateur.
            </p>
          </div>
        )}
        
        {needsPermission && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Autoriser les notifications pour rester informé des nouvelles idées et événements.
            </p>
            <Button
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="w-full"
              data-testid="button-request-permission"
            >
              <Bell className="w-4 h-4 mr-2" />
              Autoriser les notifications
            </Button>
          </div>
        )}
        
        {hasPermission && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="notifications-toggle" className="text-sm font-medium">
                  Notifications automatiques
                </Label>
                <p className="text-xs text-gray-500">
                  Nouvelles idées et événements
                </p>
              </div>
              <Switch
                id="notifications-toggle"
                checked={isSubscribed}
                onCheckedChange={handleToggleNotifications}
                disabled={isLoading}
                data-testid="switch-notifications"
              />
            </div>
            
            {isSubscribed && (
              <div className="space-y-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Notifications actives
                  </span>
                </div>
                <p className="text-xs text-green-600">
                  Vous recevrez des notifications pour :
                </p>
                <ul className="text-xs text-green-600 space-y-1">
                  <li>• Nouvelles idées proposées</li>
                  <li>• Nouveaux événements ajoutés</li>
                  <li>• Mises à jour importantes</li>
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                  className="w-full border-green-300 text-green-700 hover:bg-green-100"
                  data-testid="button-test-notification"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Tester les notifications
                </Button>
              </div>
            )}
          </div>
        )}
        
        {isLoading && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500">
              Configuration en cours...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}