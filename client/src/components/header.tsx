import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import cjdLogo from "@assets/logo-cjd-social_1756108273665.jpg";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission } from "@shared/schema";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Map routes to section names
  const getActiveSection = (): "ideas" | "propose" | "events" | "tools" => {
    if (location === "/propose") return "propose";
    if (location === "/events") return "events";
    if (location === "/tools") return "tools";
    return "ideas";
  };

  const activeSection = getActiveSection();

  // Vérifier si l'utilisateur est admin
  const isAdmin = user && hasPermission(user.role, 'admin.view');

  // Filtrer les items de menu : les admins ne voient aucun onglet
  const allMenuItems = [
    { id: "ideas" as const, label: "Voter pour des idées", route: "/" },
    { id: "propose" as const, label: "Proposer une idée", route: "/propose" },
    { id: "events" as const, label: "Événements", route: "/events" },
    { id: "tools" as const, label: "Les outils du dirigeants", route: "/tools" },
  ];

  const menuItems = isAdmin ? [] : allMenuItems;

  return (
    <header className="bg-cjd-green text-white shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <button 
              onClick={() => setLocation("/")}
              className="hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded flex items-center space-x-3"
              aria-label="Retour à la page d'accueil - Voter pour des idées"
            >
              <img 
                src={cjdLogo} 
                alt="CJD" 
                className="h-8 sm:h-10 lg:h-12 w-auto rounded-[60px]"
              />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Amiens</h1>
            </button>
          </div>
          
          <nav className="hidden lg:flex space-x-4 xl:space-x-6 items-center">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setLocation(item.route)}
                className={`hover:text-green-200 transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap ${
                  activeSection === item.id ? "border-b-2 border-white pb-1" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="lg:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-green-200 hover:bg-cjd-green-dark flex-shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-cjd-green-dark border-t border-green-600">
          <div className="container mx-auto px-3 sm:px-4 py-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setLocation(item.route);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-3 px-2 rounded hover:bg-green-600 transition-colors duration-200 ${
                  activeSection === item.id ? "bg-green-600 font-medium" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
