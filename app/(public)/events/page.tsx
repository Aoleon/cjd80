'use client';

import EventsSection from "@/components/events-section";

export default function EventsPage() {
  return (
    <div className="font-lato bg-gray-50 min-h-screen">
      <main>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          <EventsSection />
        </div>
      </main>
    </div>
  );
}
