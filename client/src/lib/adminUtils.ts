import { IDEA_STATUS } from "@shared/schema";

export function formatDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateLong(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getIdeaStatusInfo(status: string): { label: string; class: string } {
  switch (status) {
    case IDEA_STATUS.PENDING:
      return { label: "En attente", class: "bg-warning-light text-warning-dark" };
    case IDEA_STATUS.APPROVED:
      return { label: "Idée soumise au vote", class: "bg-success-light text-success-dark" };
    case IDEA_STATUS.REJECTED:
      return { label: "Rejetée", class: "bg-error-light text-error-dark" };
    case IDEA_STATUS.UNDER_REVIEW:
      return { label: "En cours d'étude", class: "bg-info-light text-info-dark" };
    case IDEA_STATUS.POSTPONED:
      return { label: "Reportée", class: "bg-gray-100 text-gray-800" };
    case IDEA_STATUS.COMPLETED:
      return { label: "Réalisée", class: "bg-success-light text-success-dark" };
    default:
      return { label: "Inconnu", class: "bg-gray-100 text-gray-800" };
  }
}

export function getEventStatusInfo(status: string | null): { label: string; class: string } {
  if (!status) {
    return { label: "Programmé", class: "bg-info-light text-info-dark" };
  }
  switch (status.toLowerCase()) {
    case "upcoming":
      return { label: "À venir", class: "bg-info-light text-info-dark" };
    case "ongoing":
      return { label: "En cours", class: "bg-success-light text-success-dark" };
    case "completed":
      return { label: "Terminé", class: "bg-gray-100 text-gray-800" };
    case "cancelled":
      return { label: "Annulé", class: "bg-error-light text-error-dark" };
    default:
      return { label: status, class: "bg-gray-100 text-gray-800" };
  }
}
