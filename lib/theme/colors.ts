/**
 * Utilitaires pour accéder aux couleurs du thème centralisé
 * TOUJOURS utiliser ces helpers au lieu de hardcoder des couleurs
 */

import { brandingCore, type BrandingColors } from '../config/branding-core';

/**
 * Récupère une couleur du thème par son nom
 *
 * @example
 * ```tsx
 * import { getColor } from '@/lib/theme/colors';
 *
 * const primaryColor = getColor('primary'); // "#00a844"
 * ```
 */
export function getColor(colorName: keyof BrandingColors): string {
  return brandingCore.colors[colorName];
}

/**
 * Récupère toutes les couleurs du thème
 */
export function getAllColors(): BrandingColors {
  return brandingCore.colors;
}

/**
 * Récupère une couleur avec fallback
 *
 * @example
 * ```tsx
 * const color = getColorOr('customColor', 'primary'); // Fallback vers primary si customColor n'existe pas
 * ```
 */
export function getColorOr(
  colorName: keyof BrandingColors,
  fallback: keyof BrandingColors
): string {
  return brandingCore.colors[colorName] || brandingCore.colors[fallback];
}

/**
 * Convertit une couleur HEX en RGB
 *
 * @example
 * ```tsx
 * hexToRgb('#00a844') // "0, 168, 68"
 * ```
 */
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';

  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * Convertit une couleur HEX en RGBA avec alpha
 *
 * @example
 * ```tsx
 * hexToRgba('#00a844', 0.5) // "rgba(0, 168, 68, 0.5)"
 * ```
 */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb}, ${alpha})`;
}

/**
 * Récupère une couleur du thème en format RGB
 *
 * @example
 * ```tsx
 * getColorRgb('primary') // "0, 168, 68"
 * // Utilisation: style={{ backgroundColor: `rgba(${getColorRgb('primary')}, 0.5)` }}
 * ```
 */
export function getColorRgb(colorName: keyof BrandingColors): string {
  return hexToRgb(brandingCore.colors[colorName]);
}

/**
 * Récupère une couleur du thème en format RGBA
 *
 * @example
 * ```tsx
 * getColorRgba('primary', 0.5) // "rgba(0, 168, 68, 0.5)"
 * ```
 */
export function getColorRgba(colorName: keyof BrandingColors, alpha: number): string {
  return hexToRgba(brandingCore.colors[colorName], alpha);
}

/**
 * Palette de couleurs pré-calculées pour usage rapide
 */
export const colors = {
  // Couleurs principales
  primary: getColor('primary'),
  primaryDark: getColor('primaryDark'),
  primaryLight: getColor('primaryLight'),
  secondary: getColor('secondary'),
  accent: getColor('accent'),
  background: getColor('background'),

  // Statuts
  success: getColor('success'),
  successDark: getColor('successDark'),
  successLight: getColor('successLight'),

  warning: getColor('warning'),
  warningDark: getColor('warningDark'),
  warningLight: getColor('warningLight'),

  error: getColor('error'),
  errorDark: getColor('errorDark'),
  errorLight: getColor('errorLight'),

  info: getColor('info'),
  infoDark: getColor('infoDark'),
  infoLight: getColor('infoLight'),

  // Charts
  chart1: getColor('chart1'),
  chart2: getColor('chart2'),
  chart3: getColor('chart3'),
  chart4: getColor('chart4'),
  chart5: getColor('chart5'),

  // Utilitaires
  white: getColor('white'),
  black: getColor('black'),
  chartBorder: getColor('chartBorder'),
  chartGrid: getColor('chartGrid'),
} as const;

/**
 * ⚠️ NE JAMAIS UTILISER DE COULEURS HARDCODÉES
 *
 * ❌ MAUVAIS:
 * ```tsx
 * <div style={{ color: '#00a844' }}>...</div>
 * <div style={{ backgroundColor: 'rgb(0, 168, 68)' }}>...</div>
 * ```
 *
 * ✅ BON:
 * ```tsx
 * import { getColor, colors } from '@/lib/theme/colors';
 *
 * <div style={{ color: colors.primary }}>...</div>
 * <div style={{ backgroundColor: getColor('primary') }}>...</div>
 * <div className="text-primary">...</div>
 * ```
 */

// Export type pour autocomplétion
export type ColorName = keyof BrandingColors;
