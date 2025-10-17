import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { ProtectedRoute } from "./lib/protected-route";
import { PWAFloatingInstall } from "@/components/pwa-floating-install";
import { PWAInstallBanner } from "@/components/pwa-install-banner";
import { PWAInstallTooltip } from "@/components/pwa-install-tooltip";
import OfflineStatusBanner from "@/components/offline-status-banner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProposePage from "@/pages/propose-page";
import EventsPage from "@/pages/events-page";
import ToolsPage from "@/pages/tools-page";
import AdminPage from "@/pages/admin-page";
import AdminPatronsPage from "@/pages/admin-patrons-page";
import AdminSponsorshipsPage from "@/pages/admin-sponsorships-page";
import AdminMembersPage from "@/pages/admin-members-page";
import AdminBrandingPage from "@/pages/admin-branding-page";
import AdminEmailConfigPage from "@/pages/admin-email-config-page";
import TestErrorPage from "@/pages/test-error-page";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { PWAUtils } from "@/lib/pwa-utils";
import { useNotificationHandler } from "@/hooks/use-notification-handler";
import { useBadge } from "@/hooks/use-badge";
import "@/lib/cache-buster";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/propose" component={ProposePage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/tools" component={ToolsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/test-error" component={TestErrorPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <ProtectedRoute path="/admin/patrons" component={AdminPatronsPage} />
      <ProtectedRoute path="/admin/sponsorships" component={AdminSponsorshipsPage} />
      <ProtectedRoute path="/admin/members" component={AdminMembersPage} />
      <ProtectedRoute path="/admin/branding" component={AdminBrandingPage} />
      <ProtectedRoute path="/admin/email-config" component={AdminEmailConfigPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PWAWrapper({ children }: { children: React.ReactNode }) {
  // Gérer les clics sur les notifications avec cleanup approprié
  useNotificationHandler();
  
  // Gérer le badge de l'application
  useBadge();

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
      <OfflineStatusBanner />
      {children}
      {/* Bannière d'invitation intelligente */}
      <PWAInstallBanner />
      {/* Tooltip avec conseils d'installation */}
      <PWAInstallTooltip />
      {/* Bouton flottant d'installation sur mobile uniquement */}
      <PWAFloatingInstall />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrandingProvider>
          <AuthProvider>
            <PWAWrapper>
              <Toaster />
              <Router />
            </PWAWrapper>
          </AuthProvider>
        </BrandingProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
