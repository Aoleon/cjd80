/**
 * Mapping centralisé des statuts vers les couleurs et labels
 */

export type StatusVariant = "default" | "secondary" | "destructive" | "outline";

export interface StatusConfig {
  label: string;
  variant: StatusVariant;
  className?: string;
}

/**
 * Mapping des statuts de membres
 */
export const MEMBER_STATUS_MAP: Record<string, StatusConfig> = {
  active: {
    label: "Actif",
    variant: "default",
    className: "bg-success text-success-foreground",
  },
  proposed: {
    label: "Proposé",
    variant: "secondary",
    className: "bg-warning text-warning-foreground",
  },
};

/**
 * Mapping des statuts de mécènes
 */
export const PATRON_STATUS_MAP: Record<string, StatusConfig> = {
  active: {
    label: "Actif",
    variant: "default",
    className: "bg-success text-success-foreground",
  },
  inactive: {
    label: "Inactif",
    variant: "secondary",
    className: "bg-gray-500 text-white",
  },
  proposed: {
    label: "Proposé",
    variant: "secondary",
    className: "bg-warning text-warning-foreground",
  },
};

/**
 * Mapping des statuts d'idées
 */
export const IDEA_STATUS_MAP: Record<string, StatusConfig> = {
  pending: {
    label: "En attente",
    variant: "secondary",
    className: "bg-warning text-warning-foreground",
  },
  approved: {
    label: "Approuvée",
    variant: "default",
    className: "bg-success text-success-foreground",
  },
  rejected: {
    label: "Rejetée",
    variant: "destructive",
    className: "bg-error text-error-foreground",
  },
  under_review: {
    label: "En révision",
    variant: "secondary",
    className: "bg-info text-info-foreground",
  },
  postponed: {
    label: "Reportée",
    variant: "secondary",
    className: "bg-gray-500 text-white",
  },
  completed: {
    label: "Terminée",
    variant: "default",
    className: "bg-success text-success-foreground",
  },
};

/**
 * Mapping des statuts d'événements
 */
export const EVENT_STATUS_MAP: Record<string, StatusConfig> = {
  draft: {
    label: "Brouillon",
    variant: "secondary",
    className: "bg-gray-500 text-white",
  },
  published: {
    label: "Publié",
    variant: "default",
    className: "bg-success text-success-foreground",
  },
  cancelled: {
    label: "Annulé",
    variant: "destructive",
    className: "bg-error text-error-foreground",
  },
  postponed: {
    label: "Reporté",
    variant: "secondary",
    className: "bg-warning text-warning-foreground",
  },
  completed: {
    label: "Terminé",
    variant: "default",
    className: "bg-success text-success-foreground",
  },
};

/**
 * Mapping des statuts de sponsorings
 */
export const SPONSORSHIP_STATUS_MAP: Record<string, StatusConfig> = {
  proposed: {
    label: "Proposé",
    variant: "secondary",
    className: "bg-warning text-warning-foreground",
  },
  confirmed: {
    label: "Confirmé",
    variant: "default",
    className: "bg-success text-success-foreground",
  },
  completed: {
    label: "Terminé",
    variant: "default",
    className: "bg-success text-success-foreground",
  },
  cancelled: {
    label: "Annulé",
    variant: "destructive",
    className: "bg-error text-error-foreground",
  },
};

/**
 * Mapping des niveaux de sponsoring
 */
export const SPONSORSHIP_LEVEL_MAP: Record<string, StatusConfig> = {
  platinum: {
    label: "Platine",
    variant: "default",
    className: "bg-purple-600 text-white",
  },
  gold: {
    label: "Or",
    variant: "default",
    className: "bg-yellow-500 text-white",
  },
  silver: {
    label: "Argent",
    variant: "default",
    className: "bg-gray-400 text-white",
  },
  bronze: {
    label: "Bronze",
    variant: "default",
    className: "bg-orange-600 text-white",
  },
  partner: {
    label: "Partenaire",
    variant: "secondary",
    className: "bg-blue-500 text-white",
  },
};

/**
 * Mapping des sévérités d'alertes
 */
export const ALERT_SEVERITY_MAP: Record<string, StatusConfig> = {
  low: {
    label: "Faible",
    variant: "secondary",
    className: "bg-blue-500 text-white",
  },
  medium: {
    label: "Moyenne",
    variant: "secondary",
    className: "bg-yellow-500 text-white",
  },
  high: {
    label: "Élevée",
    variant: "default",
    className: "bg-orange-500 text-white",
  },
  critical: {
    label: "Critique",
    variant: "destructive",
    className: "bg-error text-error-foreground",
  },
};

/**
 * Fonction utilitaire pour obtenir la configuration d'un statut
 */
export function getStatusConfig(
  status: string,
  type: "member" | "patron" | "idea" | "event" | "sponsorship" | "sponsorship-level" | "alert-severity"
): StatusConfig {
  const maps: Record<string, Record<string, StatusConfig>> = {
    member: MEMBER_STATUS_MAP,
    patron: PATRON_STATUS_MAP,
    idea: IDEA_STATUS_MAP,
    event: EVENT_STATUS_MAP,
    sponsorship: SPONSORSHIP_STATUS_MAP,
    "sponsorship-level": SPONSORSHIP_LEVEL_MAP,
    "alert-severity": ALERT_SEVERITY_MAP,
  };

  const map = maps[type];
  if (!map) {
    return {
      label: status,
      variant: "secondary",
      className: "bg-gray-500 text-white",
    };
  }
  return map[status] || {
    label: status,
    variant: "secondary",
    className: "bg-gray-500 text-white",
  };
}

