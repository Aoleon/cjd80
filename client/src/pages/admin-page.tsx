import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminSection from "@/components/admin-section";
import AdminLogin from "@/components/admin-login";
import AdminHeader from "@/components/admin-header";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Shield } from "lucide-react";
import { getShortAppName } from '@/config/branding';

export default function AdminPage() {
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
          <AdminLogin />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cjd-green" />
              Gestion du contenu
            </CardTitle>
            <CardDescription>
              Gérer les idées, événements et inscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSection />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}