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
      return { label: "En attente", class: "bg-orange-100 text-orange-800" };
    case IDEA_STATUS.APPROVED:
      return { label: "Idée soumise au vote", class: "bg-green-100 text-green-800" };
    case IDEA_STATUS.REJECTED:
      return { label: "Rejetée", class: "bg-red-100 text-red-800" };
    case IDEA_STATUS.UNDER_REVIEW:
      return { label: "En cours d'étude", class: "bg-blue-100 text-blue-800" };
    case IDEA_STATUS.POSTPONED:
      return { label: "Reportée", class: "bg-gray-100 text-gray-800" };
    case IDEA_STATUS.COMPLETED:
      return { label: "Réalisée", class: "bg-purple-100 text-purple-800" };
    default:
      return { label: "Inconnu", class: "bg-gray-100 text-gray-800" };
  }
}

export function getEventStatusInfo(status: string | null): { label: string; class: string } {
  if (!status) {
    return { label: "Programmé", class: "bg-blue-100 text-blue-800" };
  }
  switch (status.toLowerCase()) {
    case "upcoming":
      return { label: "À venir", class: "bg-blue-100 text-blue-800" };
    case "ongoing":
      return { label: "En cours", class: "bg-green-100 text-green-800" };
    case "completed":
      return { label: "Terminé", class: "bg-gray-100 text-gray-800" };
    case "cancelled":
      return { label: "Annulé", class: "bg-red-100 text-red-800" };
    default:
      return { label: status, class: "bg-gray-100 text-gray-800" };
  }
}
