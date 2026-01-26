/**
 * Export centralisé du système de thème unifié
 */

// Générateur de thème
export {
  generateLightThemeVars,
  generateDarkThemeVars,
  generateCommonVars,
  generateThemeCSS,
  useThemeColors,
  getCSSVar,
} from './theme-generator';

// Provider de thème
export { ThemeProvider, useTheme } from './theme-provider';

// Utilitaires de couleurs
export {
  getColor,
  getAllColors,
  getColorOr,
  hexToRgb,
  hexToRgba,
  getColorRgb,
  getColorRgba,
  colors,
} from './colors';

// Types
export type { ThemeProviderProps } from './theme-provider';
export type { ColorName } from './colors';
