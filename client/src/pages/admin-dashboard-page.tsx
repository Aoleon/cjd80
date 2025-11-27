import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, TrendingUp } from "lucide-react";
import { getShortAppName } from '@/config/branding';
import AdminUnifiedDashboard from "@/components/admin/AdminUnifiedDashboard";

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-cjd-green text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold">{getShortAppName()}</h1>
                <p className="text-white/90">Administration - Boîte à Kiffs</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Veuillez vous connecter pour accéder à l'administration.</p>
        </main>
      </div>
    );
  }

  return (
    <AdminPageLayout
      title="Tableau de bord"
      description={`Vue d'ensemble de la plateforme ${getShortAppName()}`}
      breadcrumbs={[
        { label: "Dashboard" },
      ]}
      icon={<TrendingUp className="w-5 h-5 text-cjd-green" />}
      showCard={true}
    >
      <AdminUnifiedDashboard />
    </AdminPageLayout>
  );
}

