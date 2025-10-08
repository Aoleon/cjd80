export interface IdeaWithVotes {
  id: string;
  title: string;
  description: string | null;
  proposedBy: string;
  proposedByEmail: string;
  status: string;
  featured: boolean;
  voteCount: number;
  createdAt: Date;
  deadline: Date | null;
  updatedAt: Date;
  updatedBy: string | null;
}

export interface EventWithInscriptions {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  location: string | null;
  maxParticipants: number | null;
  helloAssoLink: string | null;
  enableExternalRedirect: boolean;
  externalRedirectUrl: string | null;
  showInscriptionsCount: boolean;
  showAvailableSeats: boolean;
  allowUnsubscribe: boolean;
  redUnsubscribeButton: boolean;
  buttonMode: string;
  customButtonText: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | null;
  inscriptionCount: number;
  unsubscriptionCount: number;
}

export interface AdminStats {
  members: { total: number; active: number; proposed: number; recentActivity: number };
  patrons: { total: number; active: number; proposed: number };
  ideas: { total: number; pending: number; approved: number };
  events: { total: number; upcoming: number };
}
