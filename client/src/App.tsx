import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProposePage from "@/pages/propose-page";
import AdminPage from "@/pages/admin-page";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { PWAUtils } from "@/lib/pwa-utils";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/propose" component={ProposePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PWAWrapper({ children }: { children: React.ReactNode }) {
  const { shouldShowAutoPrompt, showPrompt } = usePWAInstall();

  useEffect(() => {
    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('[PWA] Service Worker enregistré:', registration.scope);
        })
        .catch(error => {
          console.error('[PWA] Erreur enregistrement Service Worker:', error);
        });
    }

    // Précharger les ressources critiques
    PWAUtils.preloadCriticalResources([
      '/api/ideas',
      '/api/events'
    ]);

    // Nettoyer les anciens caches
    PWAUtils.clearOldCaches();
  }, []);

  return (
    <>
      {children}
      {shouldShowAutoPrompt() && showPrompt && (
        <PWAInstallPrompt variant="banner" />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PWAWrapper>
            <Toaster />
            <Router />
          </PWAWrapper>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
