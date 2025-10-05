import Layout from "@/components/layout";
import EventsSection from "@/components/events-section";

export default function EventsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <EventsSection />
      </div>
    </Layout>
  );
}
