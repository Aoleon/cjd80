'use client';

/**
 * Provider de thème unifié avec support dark mode
 * Basé sur next-themes pour la persistance et la synchronisation
 */

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export type ThemeProviderProps = {
  children: React.ReactNode;
} & React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Hook pour gérer le thème dans les composants
 *
 * @example
 * ```tsx
 * import { useTheme } from '@/lib/theme/theme-provider';
 *
 * function ThemeSwitcher() {
 *   const { theme, setTheme } = useTheme();
 *
 *   return (
 *     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
 *       Toggle {theme} mode
 *     </button>
 *   );
 * }
 * ```
 */
export { useTheme } from 'next-themes';
