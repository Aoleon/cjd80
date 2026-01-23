import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility pour combiner des classes Tailwind
 * Utilise clsx + tailwind-merge pour éviter les conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
