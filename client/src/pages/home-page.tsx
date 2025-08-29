import { useState } from "react";
import Header from "@/components/header";
import IdeasSection from "@/components/ideas-section";
import ProposeSection from "@/components/propose-section";
import EventsSection from "@/components/events-section";
import AdminSection from "@/components/admin-section";
import ToolsPage from "@/pages/tools-page";

type Section = "ideas" | "propose" | "events" | "tools" | "admin";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<Section>("ideas");

  return (
    <div className="font-lato bg-gray-50 min-h-screen">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {activeSection === "ideas" && (
          <>
            <IdeasSection onNavigateToPropose={() => setActiveSection("propose")} />
            {/* Séparateur visuel entre les sections */}
            <div className="mt-8 sm:mt-12 border-t-4 border-cjd-green pt-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-cjd-green">📅 Événements à venir</h2>
                <p className="text-gray-600 mt-2">Inscrivez-vous aux prochains événements CJD Amiens</p>
              </div>
              <EventsSection />
            </div>
          </>
        )}
        {activeSection === "propose" && <ProposeSection />}
        {activeSection === "events" && <EventsSection />}
        {activeSection === "tools" && <ToolsPage />}
        {activeSection === "admin" && <AdminSection />}
      </main>

      <footer className="bg-gray-800 text-white py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 text-center sm:text-left">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cjd-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">CJD</span>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">Centre des Jeunes Dirigeants d'Amiens</p>
                <p className="text-xs sm:text-sm text-gray-400">© 2025 - Tous droits réservés</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <button
                onClick={() => setActiveSection("admin")}
                className="text-xs sm:text-sm text-gray-400 hover:text-cjd-green transition-colors duration-200 underline"
                data-testid="link-admin"
              >
                Administration
              </button>
              <div className="text-xs sm:text-sm text-gray-400">
                <span>Créé avec ❤️ par <a href="https://robinswood.io" target="_blank" rel="noopener noreferrer" className="text-cjd-green hover:text-green-400 transition-colors duration-200">Thibault</a></span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
