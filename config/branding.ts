// Configuration centralisée du branding/thème de l'application
// Version Next.js avec chemins publics (pas de Vite bundling)

// Import de la configuration de base (compatible Node.js)
import { brandingCore } from './branding-core';

// Configuration complète avec assets pour Next.js
export const branding = {
  ...brandingCore,

  // Assets (logos, icônes) - chemins publics pour Next.js
  assets: {
    logo: "/logo-cjd.png",  // Fichier dans public/
    icon192: "/icon-192.jpg",  // Fichiers dans public/
    icon512: "/icon-512.jpg",  // Fichiers dans public/
    boiteKiffImage: "/boite-kiff.jpeg",  // Fichier dans public/
  },
} as const;

// Ré-export des types et helpers depuis branding-core
export type { BrandingCore, BrandingColors, BrandingFonts } from './branding-core';
export { getBrandColor, getAppName, getShortAppName, getOrgName } from './branding-core';

// Type pour la configuration complète avec assets
export type Branding = typeof branding;
