import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSection from "@/components/admin-section";
import AdminLogin from "@/components/admin-login";
import AdminDbMonitor from "@/components/admin-db-monitor";
import { NotificationSettings } from "@/components/notification-settings";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Shield, Database, BarChart3, Bell } from "lucide-react";

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
                <h1 className="text-3xl font-bold">CJD Amiens</h1>
                <p className="text-green-100">Administration - Boîte à Kiffs</p>
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
      <header className="bg-cjd-green text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">CJD Amiens</h1>
              <p className="text-green-100">Administration - Boîte à Kiffs</p>
            </div>
            <div className="text-right">
              <p className="text-green-100">Connecté en tant que</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="management" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Gestion</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistiques</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management">
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
          </TabsContent>

          <TabsContent value="notifications">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-cjd-green" />
                    Paramètres des notifications
                  </CardTitle>
                  <CardDescription>
                    Configurer les notifications push automatiques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationSettings />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-cjd-green" />
                  Monitoring de la base de données
                </CardTitle>
                <CardDescription>
                  Surveillance en temps réel des performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminDbMonitor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cjd-green" />
                  Statistiques détaillées
                </CardTitle>
                <CardDescription>
                  Analyse de l'activité et engagement utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Module statistiques en développement
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}