"use client";

import { useState } from 'react';
import { Bell, BellOff, Settings, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications } from '@/hooks/use-notifications';
import { useRouter } from 'next/navigation';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const {
    permission,
    isSubscribed,
    isSupported,
    subscribe,
    unsubscribe,
    testNotification,
  } = useNotifications();
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  if (!isSupported) return null;

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
    setIsLoading(false);
  };

  const handleTest = async () => {
    await testNotification();
    setOpen(false);
  };

  const handleSettings = () => {
    router.push('/admin/settings/notifications');
    setOpen(false);
  };

  const isDenied = permission === 'denied';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={"relative text-white hover:text-cjd-green hover:bg-gray-700 " + className}
          data-testid="button-notification-bell"
        >
          {isSubscribed ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          {isSubscribed && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-cjd-green rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Notifications Push</span>
            {isSubscribed ? (
              <span className="flex items-center text-xs text-cjd-green">
                <Check className="h-3 w-3 mr-1" />
                Actives
              </span>
            ) : isDenied ? (
              <span className="flex items-center text-xs text-destructive">
                <X className="h-3 w-3 mr-1" />
                Refusées
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Inactives</span>
            )}
          </div>

          {isDenied ? (
            <p className="text-xs text-muted-foreground">
              Les notifications ont été refusées. Activez-les dans les paramètres de votre navigateur.
            </p>
          ) : (
            <>
              <Button
                variant={isSubscribed ? "outline" : "default"}
                size="sm"
                className="w-full"
                onClick={handleToggle}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Chargement..."
                ) : isSubscribed ? (
                  "Désactiver"
                ) : (
                  "Activer les notifications"
                )}
              </Button>

              {isSubscribed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleTest}
                >
                  Tester une notification
                </Button>
              )}
            </>
          )}

          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={handleSettings}
            >
              <Settings className="h-3 w-3 mr-2" />
              Paramètres avancés
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
