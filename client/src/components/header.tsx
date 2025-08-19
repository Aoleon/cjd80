import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import cjdLogo from "@assets/logo-cjd-social_1755640197258.jpg";

interface HeaderProps {
  activeSection: "ideas" | "propose" | "events" | "admin";
  setActiveSection: (section: "ideas" | "propose" | "events" | "admin") => void;
}

export default function Header({ activeSection, setActiveSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "ideas" as const, label: "Voter pour des idées" },
    { id: "propose" as const, label: "Proposer une idée" },
    { id: "events" as const, label: "Événements" },
    { id: "admin" as const, label: "Administration" },
  ];

  return (
    <header className="bg-cjd-green text-white shadow-lg">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <img 
              src={cjdLogo} 
              alt="CJD - Centre des Jeunes Dirigeants Amiens" 
              className="h-10 sm:h-12 w-auto object-contain bg-white rounded-lg p-1"
            />
          </div>
          
          <nav className="hidden lg:flex space-x-4 xl:space-x-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`hover:text-green-200 transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap ${
                  activeSection === item.id ? "border-b-2 border-white pb-1" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:text-green-200 hover:bg-cjd-green-dark flex-shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>
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
                  setActiveSection(item.id);
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
