import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Users, CalendarPlus, Loader2, Clock, Star } from "lucide-react";
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

  const formatShortDate = (date: string) => {
    const dateObj = new Date(date);
    return {
      day: dateObj.getDate(),
      month: dateObj.toLocaleDateString("fr-FR", { month: "short" }),
      time: dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    };
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-cjd-green to-green-600 rounded-xl shadow-lg p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/20 rounded-full p-2">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Événements à venir</h2>
        </div>
        <p className="text-green-100 text-base sm:text-lg opacity-90">
          Découvrez les prochains événements de la section CJD Amiens et inscrivez-vous facilement
        </p>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
        </div>
      ) : events && events.length > 0 ? (
        <div className="space-y-6 sm:space-y-8">
          {events.map((event) => {
            const shortDate = formatShortDate(event.date.toString());
            const isEventUpcoming = isUpcoming(event.date.toString());
            const isEventFull = Boolean(event.maxParticipants && event.inscriptionCount >= event.maxParticipants);
            
            return (
              <Card key={event.id} className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 border-l-cjd-green overflow-hidden bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Date Badge */}
                    <div className="lg:w-32 flex lg:flex-col items-center justify-center bg-gradient-to-br from-cjd-green to-green-600 text-white p-4 lg:p-6">
                      <div className="text-center">
                        <div className="text-2xl lg:text-4xl font-bold leading-tight">{shortDate.day}</div>
                        <div className="text-sm lg:text-base font-medium uppercase tracking-wide opacity-90">{shortDate.month}</div>
                        <div className="flex items-center justify-center mt-1 lg:mt-2 text-xs lg:text-sm opacity-80">
                          <Clock className="w-3 h-3 mr-1" />
                          {shortDate.time}
                        </div>
                      </div>
                      {isEventUpcoming && (
                        <div className="hidden lg:block mt-3">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
                            À venir
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 p-4 lg:p-6">
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title with status indicator */}
                          <div className="flex items-start gap-3 mb-4">
                            <h3 className="font-bold text-xl lg:text-2xl text-gray-800 leading-tight group-hover:text-cjd-green transition-colors">
                              {event.title}
                            </h3>
                            {isEventFull && (
                              <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full flex-shrink-0">
                                COMPLET
                              </span>
                            )}
                            {!isEventFull && isEventUpcoming && event.maxParticipants && (
                              event.inscriptionCount / event.maxParticipants > 0.8 && (
                                <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 animate-pulse">
                                  DERNIÈRES PLACES
                                </span>
                              )
                            )}
                          </div>

                          {/* Event Info */}
                          <div className="space-y-3 mb-5">
                            <div className="flex items-start text-gray-600">
                              <Calendar className="w-5 h-5 mr-3 mt-0.5 text-cjd-green flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-800">{formatDate(event.date.toString())}</span>
                                <div className="text-sm text-gray-500 mt-1">
                                  {isEventUpcoming ? "Événement à venir" : "Événement passé"}
                                </div>
                              </div>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-start text-gray-600">
                                <MapPin className="w-5 h-5 mr-3 mt-0.5 text-cjd-green flex-shrink-0" />
                                <span className="text-base font-medium text-gray-800">{event.location}</span>
                              </div>
                            )}
                            
                            {event.helloAssoLink && (
                              <div className="flex items-center text-gray-600 bg-blue-50 rounded-lg p-3">
                                <Star className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                                <a 
                                  href={event.helloAssoLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                                >
                                  💳 Inscription payante - HelloAsso
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {event.description && (
                            <div className="mb-5 p-4 bg-gray-50 rounded-lg border-l-2 border-l-cjd-green">
                              <p className="text-gray-700 text-base leading-relaxed">{event.description}</p>
                            </div>
                          )}

                          {/* Participants Info */}
                          {event.maxParticipants && (
                            <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
                              {event.showInscriptionsCount && (
                                <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
                                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                                  <span className="font-medium text-gray-800">
                                    <span className="text-blue-600 font-bold">{event.inscriptionCount}</span> inscrit{event.inscriptionCount > 1 ? 's' : ''}
                                    <span className="text-gray-500 mx-1">/</span>
                                    <span className="font-bold">{event.maxParticipants}</span> places
                                  </span>
                                </div>
                              )}
                              
                              {event.showAvailableSeats && (
                                <div className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full shadow-sm ${
                                  isEventFull
                                    ? 'bg-red-500 text-white'
                                    : event.inscriptionCount / event.maxParticipants > 0.8 
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-green-500 text-white'
                                }`}>
                                  {isEventFull
                                    ? '🚫 Événement complet' 
                                    : event.maxParticipants - event.inscriptionCount <= 5
                                      ? `⚡ Plus que ${event.maxParticipants - event.inscriptionCount} place${event.maxParticipants - event.inscriptionCount > 1 ? 's' : ''}`
                                      : `✅ ${event.maxParticipants - event.inscriptionCount} places disponibles`}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Registration Button */}
                        <div className="flex-shrink-0 xl:ml-8 mt-4 xl:mt-0">
                          <Button
                            onClick={() => handleRegisterClick(event)}
                            disabled={isEventFull}
                            size="lg"
                            className={`w-full xl:w-auto text-base font-semibold px-8 py-3 transition-all duration-200 shadow-lg hover:shadow-xl ${
                              isEventFull
                                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                : 'bg-gradient-to-r from-cjd-green to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105'
                            }`}
                          >
                            <CalendarPlus className="w-5 h-5 mr-2" />
                            {isEventFull
                              ? '❌ Complet' 
                              : "🎯 S'inscrire maintenant"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-3">Aucun événement prévu pour le moment</h3>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Restez connecté ! De nouveaux événements seront bientôt disponibles pour enrichir vos échanges professionnels.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg inline-block">
            <p className="text-blue-700 text-sm font-medium">💡 En attendant, n'hésitez pas à proposer vos propres idées d'événements !</p>
          </div>
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
