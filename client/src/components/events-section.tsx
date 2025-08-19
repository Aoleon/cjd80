import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Users, CalendarPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EventRegistrationModal from "./event-registration-modal";
import type { Event } from "@shared/schema";

interface EventWithInscriptions extends Omit<Event, "inscriptionCount"> {
  inscriptionCount: number;
}

export default function EventsSection() {
  const [selectedEvent, setSelectedEvent] = useState<EventWithInscriptions | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  const { data: events, isLoading, error } = useQuery<EventWithInscriptions[]>({
    queryKey: ["/api/events"],
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erreur lors du chargement des événements</p>
      </div>
    );
  }

  const handleRegisterClick = (event: EventWithInscriptions) => {
    setSelectedEvent(event);
    setRegistrationModalOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-cjd-green">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Événements à venir</h2>
        <p className="text-gray-600">
          Découvrez les prochains événements de la section CJD Amiens et inscrivez-vous
        </p>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : events && events.length > 0 ? (
        <div className="space-y-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">{event.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-cjd-green flex-shrink-0" />
                        <span>{formatDate(event.date.toString())}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-cjd-green flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.helloAssoLink && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-cjd-green flex-shrink-0" />
                          <a href={event.helloAssoLink} target="_blank" rel="noopener noreferrer" className="text-cjd-green hover:underline">
                            Lien d'inscription HelloAsso
                          </a>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-gray-600 mb-4">{event.description}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>
                        {event.inscriptionCount} inscrit{event.inscriptionCount !== 1 ? 's' : ''}
                        {event.maxParticipants && ` / ${event.maxParticipants} places`}
                      </span>
                      {event.maxParticipants && (
                        <div className="ml-2">
                          <div className={`inline-block px-2 py-1 text-xs rounded-full ${
                            event.inscriptionCount >= event.maxParticipants 
                              ? 'bg-red-100 text-red-800'
                              : event.inscriptionCount / event.maxParticipants > 0.8 
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {event.inscriptionCount >= event.maxParticipants 
                              ? 'Complet' 
                              : `${Math.round((event.inscriptionCount / event.maxParticipants) * 100)}% rempli`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <Button
                      onClick={() => handleRegisterClick(event)}
                      disabled={event.maxParticipants && event.inscriptionCount >= event.maxParticipants}
                      className={`w-full lg:w-auto transition-colors duration-200 ${
                        event.maxParticipants && event.inscriptionCount >= event.maxParticipants
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-cjd-green text-white hover:bg-cjd-green-dark'
                      }`}
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      {event.maxParticipants && event.inscriptionCount >= event.maxParticipants 
                        ? 'Complet' 
                        : "S'inscrire"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun événement prévu</h3>
          <p className="text-gray-500">Les prochains événements seront bientôt disponibles</p>
        </div>
      )}

      <EventRegistrationModal
        open={registrationModalOpen}
        onOpenChange={setRegistrationModalOpen}
        event={selectedEvent}
      />
    </section>
  );
}
