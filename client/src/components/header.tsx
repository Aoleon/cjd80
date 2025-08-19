import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-cjd-green font-bold text-lg">CJD</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Centre des Jeunes Dirigeants</h1>
              <p className="text-sm opacity-90">Amiens</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`hover:text-green-200 transition-colors duration-200 font-medium ${
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
            className="md:hidden text-white hover:text-green-200 hover:bg-cjd-green-dark"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cjd-green-dark">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 hover:text-green-200 transition-colors duration-200"
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
