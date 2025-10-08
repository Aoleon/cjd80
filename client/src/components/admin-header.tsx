import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Shield, Home, Lightbulb, Plus, Calendar, UserCircle, Users, LogOut, Menu, X, Palette } from "lucide-react";
import { getShortAppName } from '@/config/branding';

export default function AdminHeader() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseMenuItems = [
    { id: "home", label: "Accueil", icon: Home, path: "/" },
    { id: "ideas", label: "Voter", icon: Lightbulb, path: "/" },
    { id: "propose", label: "Proposer", icon: Plus, path: "/propose" },
    { id: "events", label: "Événements", icon: Calendar, path: "/" },
    { id: "divider", label: "", icon: null as any, path: "" },
    { id: "admin", label: "Gestion", icon: Shield, path: "/admin" },
    { id: "members", label: "Membres", icon: UserCircle, path: "/admin/members" },
  ];

  const superAdminItems = user?.role === "super_admin" 
    ? [
        { id: "patrons", label: "Mécènes", icon: Users, path: "/admin/patrons" },
        { id: "branding", label: "Branding", icon: Palette, path: "/admin/branding" }
      ]
    : [];

  const menuItems = [...baseMenuItems, ...superAdminItems];

  const handleNavigation = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-gray-800 dark:bg-gray-900 text-white shadow-lg border-b-4 border-cjd-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-cjd-green" data-testid="icon-admin-shield" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" data-testid="text-admin-title">{getShortAppName()} - Administration</h1>
              <p className="text-gray-300 text-sm" data-testid="text-admin-subtitle">Espace de gestion</p>
            </div>
          </div>
          
          {/* Navigation Desktop */}
          <nav className="hidden lg:flex space-x-4 items-center">
            {menuItems.map((item) => {
              if (item.id === "divider") {
                return <div key="divider" className="h-6 w-px bg-gray-600" data-testid="divider-nav" />;
              }
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className="hover:text-cjd-green transition-colors duration-200 font-medium text-sm whitespace-nowrap flex items-center gap-2"
                  data-testid={`link-${item.id}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          {/* User info + Logout */}
          <div className="flex items-center space-x-4">
            {/* Menu Mobile Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-cjd-green hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
            
            {/* User Info - Hidden on mobile */}
            <div className="hidden sm:block text-right">
              <p className="text-gray-300 text-xs">Connecté en tant que</p>
              <p className="font-medium text-sm" data-testid="text-user-email">{user?.email}</p>
              <p className="text-cjd-green text-xs capitalize" data-testid="text-user-role">
                {user?.role?.replace('_', ' ') ?? ''}
              </p>
            </div>
            
            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="border-gray-600 hover:bg-gray-700 text-white hover:text-white"
              data-testid="button-logout"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Déroulant */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-700 border-t border-gray-600">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {/* User info on mobile */}
            <div className="sm:hidden pb-3 mb-3 border-b border-gray-600">
              <p className="text-gray-300 text-xs">Connecté en tant que</p>
              <p className="font-medium text-sm">{user?.email}</p>
              <p className="text-cjd-green text-xs capitalize">{user?.role?.replace('_', ' ') ?? ''}</p>
            </div>
            
            {menuItems.map((item) => {
              if (item.id === "divider") {
                return <div key="divider" className="h-px bg-gray-600 my-2" />;
              }
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center gap-3 w-full text-left py-3 px-2 rounded hover:bg-gray-600 transition-colors duration-200"
                  data-testid={`link-mobile-${item.id}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
