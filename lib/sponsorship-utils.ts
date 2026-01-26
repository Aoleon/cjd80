import { SPONSORSHIP_LEVEL_LABELS, type SponsorshipLevel } from "@shared/schema";

/**
 * Get the display label for a sponsorship level
 */
export function getSponsorshipLevelLabel(level: SponsorshipLevel): string {
  return SPONSORSHIP_LEVEL_LABELS[level] || level;
}

/**
 * Get the badge CSS classes for a sponsorship level
 * Colors: Platine=violet, Or=amber, Argent=slate, Bronze=orange, Partenaire=blue
 */
export function getSponsorshipLevelBadgeClass(level: SponsorshipLevel): string {
  const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
  
  switch (level) {
    case 'platinum':
      return `${baseClasses} bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200`;
    case 'gold':
      return `${baseClasses} bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200`;
    case 'silver':
      return `${baseClasses} bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200`;
    case 'bronze':
      return `${baseClasses} bg-warning-light text-warning-dark dark:bg-warning-dark dark:text-warning-light`;
    case 'partner':
      return `${baseClasses} bg-info-light text-info-dark dark:bg-info-dark dark:text-info-light`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
  }
}

/**
 * Get the icon/emoji for a sponsorship level
 */
export function getSponsorshipLevelIcon(level: SponsorshipLevel): string {
  switch (level) {
    case 'platinum':
      return '💎';
    case 'gold':
      return '🥇';
    case 'silver':
      return '🥈';
    case 'bronze':
      return '🥉';
    case 'partner':
      return '🤝';
    default:
      return '⭐';
  }
}

/**
 * Check if a sponsorship level is premium (Platinum or Gold)
 */
export function isPremiumSponsorship(level: SponsorshipLevel): boolean {
  return level === 'platinum' || level === 'gold';
}

/**
 * Type for public sponsorship with patron information
 */
export interface PublicSponsorship {
  id: string;
  eventId: string;
  patronId: string;
  level: SponsorshipLevel;
  amount: number;
  benefits: string | null;
  isPubliclyVisible: boolean;
  status: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  patronFirstName: string;
  patronLastName: string;
  patronCompany: string | null;
}
