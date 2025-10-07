export interface IdeaWithVotes {
  id: string;
  title: string;
  description: string | null;
  proposedBy: string;
  proposedByEmail: string | null;
  status: string;
  featured: boolean;
  voteCount: number;
  createdAt: Date | string;
  deadline: Date | string | null;
  updatedAt: Date | string | null;
  updatedBy: string | null;
}

export interface EventWithInscriptions {
  id: string;
  title: string;
  description: string | null;
  date: Date | string;
  location: string | null;
  helloAssoLink: string | null;
  inscriptionCount: number;
  unsubscriptionCount: number;
  status: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  updatedBy: string | null;
  maxParticipants: number | null;
  registrationDeadline: Date | string | null;
  price: number | null;
  imageUrl: string | null;
  tags: string[] | null;
  organizerId: string | null;
}

export interface AdminStats {
  members: { total: number; active: number; proposed: number; recentActivity: number };
  patrons: { total: number; active: number; proposed: number };
  ideas: { total: number; pending: number; approved: number };
  events: { total: number; upcoming: number };
}
