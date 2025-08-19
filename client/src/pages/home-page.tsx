import { useState } from "react";
import Header from "@/components/header";
import IdeasSection from "@/components/ideas-section";
import ProposeSection from "@/components/propose-section";
import EventsSection from "@/components/events-section";
import AdminSection from "@/components/admin-section";

type Section = "ideas" | "propose" | "events" | "admin";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<Section>("ideas");

  return (
    <div className="font-lato bg-gray-50 min-h-screen">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="container mx-auto px-4 py-8">
        {activeSection === "ideas" && <IdeasSection />}
        {activeSection === "propose" && <ProposeSection />}
        {activeSection === "events" && <EventsSection />}
        {activeSection === "admin" && <AdminSection />}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-cjd-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold">CJD</span>
              </div>
              <div>
                <p className="font-medium">Centre des Jeunes Dirigeants d'Amiens</p>
                <p className="text-sm text-gray-400">© 2024 - Tous droits réservés</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              <a href="#" className="hover:text-white">Mentions légales</a> | 
              <a href="#" className="hover:text-white"> Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
