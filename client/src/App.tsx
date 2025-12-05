import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { FeatureConfigProvider, useFeatureConfig } from "@/contexts/FeatureConfigContext";
import FeatureGuard from "@/components/FeatureGuard";
import { ProtectedRoute } from "./lib/protected-route";
import { PWAFloatingInstall } from "@/components/pwa-floating-install";
import { PWAInstallBanner } from "@/components/pwa-install-banner";
import { PWAInstallTooltip } from "@/components/pwa-install-tooltip";
import OfflineStatusBanner from "@/components/offline-status-banner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { Loader2 } from "lucide-react";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProposePage from "@/pages/propose-page";
import EventsPage from "@/pages/events-page";
import ToolsPage from "@/pages/tools-page";
import LoanPage from "@/pages/loan-page";
import StatusPage from "@/pages/status-page";
import OnboardingPage from "@/pages/onboarding-page";
import TestErrorPage from "@/pages/test-error-page";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { PWAUtils } from "@/lib/pwa-utils";
import { useNotificationHandler } from "@/hooks/use-notification-handler";
import { useBadge } from "@/hooks/use-badge";
import "@/lib/cache-buster";

// Lazy loading des pages admin volumineuses
const AdminPage = lazy(() => import("@/pages/admin-page"));
const AdminDashboardPage = lazy(() => import("@/pages/admin-dashboard-page"));
const AdminPatronsPage = lazy(() => import("@/pages/admin-patrons-page"));
const AdminSponsorshipsPage = lazy(() => import("@/pages/admin-sponsorships-page"));
const AdminMembersPage = lazy(() => import("@/pages/admin-members-page"));
const AdminBrandingPage = lazy(() => import("@/pages/admin-branding-page"));
const AdminEmailConfigPage = lazy(() => import("@/pages/admin-email-config-page"));
const AdminTrackingPage = lazy(() => import("@/pages/admin-tracking-page"));
// Nouvelles pages modulaires
const AdminCrmMembersPage = lazy(() => import("@/pages/admin/crm/members-page"));
const AdminCrmPatronsPage = lazy(() => import("@/pages/admin/crm/patrons-page"));
const AdminContentIdeasPage = lazy(() => import("@/pages/admin/content/ideas-page"));
const AdminContentEventsPage = lazy(() => import("@/pages/admin/content/events-page"));
const AdminContentLoansPage = lazy(() => import("@/pages/admin/content/loans-page"));
const AdminFinanceSponsorshipsPage = lazy(() => import("@/pages/admin/finance/sponsorships-page"));
const AdminFinanceDashboardPage = lazy(() => import("@/pages/admin/finance/dashboard-page"));
const AdminFinanceBudgetsPage = lazy(() => import("@/pages/admin/finance/budgets-page"));
const AdminFinanceExpensesPage = lazy(() => import("@/pages/admin/finance/expenses-page"));
const AdminFinanceForecastsPage = lazy(() => import("@/pages/admin/finance/forecasts-page"));
const AdminFinanceReportsPage = lazy(() => import("@/pages/admin/finance/reports-page"));
const AdminSettingsBrandingPage = lazy(() => import("@/pages/admin/settings/branding-page"));
const AdminSettingsEmailConfigPage = lazy(() => import("@/pages/admin/settings/email-config-page"));
const AdminSettingsFeaturesPage = lazy(() => import("@/pages/admin/settings/features-page"));

// Fallback pour le lazy loading
const AdminPageFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
  </div>
);

function Router() {
  const { isFeatureEnabled } = useFeatureConfig();
  // Base path pour le déploiement sur /cjd80
  const basePath = import.meta.env.VITE_BASE_PATH ? import.meta.env.VITE_BASE_PATH.replace(/\/$/, '') : '';

  return (
    <WouterRouter base={basePath}>
      <Switch>
        <Route path="/" component={HomePage} />
      <Route path="/propose">
        <FeatureGuard featureKey="ideas" featureName="La boîte à idées">
          <ProposePage />
        </FeatureGuard>
      </Route>
      <Route path="/events">
        <FeatureGuard featureKey="events" featureName="Les événements">
          <EventsPage />
        </FeatureGuard>
      </Route>
      <Route path="/tools" component={ToolsPage} />
      <Route path="/loan">
        <FeatureGuard featureKey="loan" featureName="Le prêt de matériel">
          <LoanPage />
        </FeatureGuard>
      </Route>
      <Route path="/statuts" component={StatusPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/test-error" component={TestErrorPage} />
      {/* Routes legacy (maintenues pour compatibilité) */}
      <ProtectedRoute path="/admin">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/patrons">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminPatronsPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/sponsorships">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminSponsorshipsPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/members">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminMembersPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/tracking">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminTrackingPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/branding">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminBrandingPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/email-config">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminEmailConfigPage />
        </Suspense>
      </ProtectedRoute>
      
      {/* Nouvelles routes modulaires */}
      <ProtectedRoute path="/admin/dashboard">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminDashboardPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/crm/members">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminCrmMembersPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/crm/patrons">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminCrmPatronsPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/content/ideas">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminContentIdeasPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/content/events">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminContentEventsPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/content/loans">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminContentLoansPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/finance/sponsorships">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminFinanceSponsorshipsPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/finance/dashboard">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminFinanceDashboardPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/finance/budgets">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminFinanceBudgetsPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/finance/expenses">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminFinanceExpensesPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/finance/forecasts">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminFinanceForecastsPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/finance/reports">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminFinanceReportsPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/settings/branding">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminSettingsBrandingPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/settings/email-config">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminSettingsEmailConfigPage />
        </Suspense>
      </ProtectedRoute>
      <ProtectedRoute path="/admin/settings/features">
        <Suspense fallback={<AdminPageFallback />}>
          <AdminSettingsFeaturesPage />
        </Suspense>
      </ProtectedRoute>
      <Route component={NotFound} />
    </Switch>
    </WouterRouter>
  );
}

function PWAWrapper({ children }: { children: React.ReactNode }) {
  // Gérer les clics sur les notifications avec cleanup approprié
  useNotificationHandler();
  
  // Gérer le badge de l'application
  useBadge();

  useEffect(() => {
    const basePath = import.meta.env.VITE_BASE_PATH ? import.meta.env.VITE_BASE_PATH.replace(/\/$/, '') : '';

    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${basePath}/sw.js`)
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
      `${basePath}/api/ideas`,
      `${basePath}/api/events`
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
            <FeatureConfigProvider>
              <OnboardingGuard>
                <PWAWrapper>
                  <Toaster />
                  <Router />
                </PWAWrapper>
              </OnboardingGuard>
            </FeatureConfigProvider>
          </AuthProvider>
        </BrandingProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
