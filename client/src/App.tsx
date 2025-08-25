import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { PWAFloatingInstall } from "@/components/pwa-floating-install";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProposePage from "@/pages/propose-page";
import AdminPage from "@/pages/admin-page";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { PWAUtils } from "@/lib/pwa-utils";
import "@/lib/cache-buster";

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
  useEffect(() => {
    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          if (import.meta.env.DEV) {
            console.log('[PWA] Service Worker enregistré:', registration.scope);
          }
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
      {/* Bouton flottant d'installation sur mobile uniquement */}
      <PWAFloatingInstall />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PWAWrapper>
          <Toaster />
          <Router />
        </PWAWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
