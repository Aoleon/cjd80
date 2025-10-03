import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminSection from "@/components/admin-section";
import AdminLogin from "@/components/admin-login";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Shield, Menu, X, Home, Lightbulb, Calendar, Plus, Users, UserCircle } from "lucide-react";
import cjdLogo from "@assets/logo-cjd-social_1756108273665.jpg";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseMenuItems = [
    { id: "home", label: "Accueil", icon: Home, path: "/" },
    { id: "ideas", label: "Voter pour des idées", icon: Lightbulb, path: "/" },
    { id: "propose", label: "Proposer une idée", icon: Plus, path: "/propose" },
    { id: "events", label: "Événements", icon: Calendar, path: "/" },
    { id: "members", label: "Membres", icon: UserCircle, path: "/admin/members" },
  ];

  // Ajouter le lien Mécènes uniquement pour les super-admins
  const menuItems = user?.role === "super_admin" 
    ? [...baseMenuItems, { id: "patrons", label: "Mécènes", icon: Users, path: "/admin/patrons" }]
    : baseMenuItems;

  const handleNavigation = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

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
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleNavigation("/")}
                className="hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded flex items-center space-x-3"
                aria-label="Retour à la page d'accueil"
              >
                <img 
                  src={cjdLogo} 
                  alt="CJD" 
                  className="h-8 sm:h-10 w-auto rounded-[60px]"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">CJD Amiens</h1>
                  <p className="text-green-100 text-sm">Administration - Boîte à Kiffs</p>
                </div>
              </button>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex space-x-6 items-center">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className="hover:text-green-200 transition-colors duration-200 font-medium text-sm whitespace-nowrap flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              {/* Menu Mobile */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-green-200 hover:bg-cjd-green-dark"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
              
              {/* Info utilisateur */}
              <div className="hidden sm:block text-right">
                <p className="text-green-100 text-sm">Connecté en tant que</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Mobile Déroulant */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-cjd-green-dark border-t border-green-600">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center gap-3 w-full text-left py-3 px-2 rounded hover:bg-green-600 transition-colors duration-200"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

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