// Configuration centralisée du branding/thème de l'application
// Ce fichier étend la configuration de base avec les assets bundlés par Vite

// Import de la configuration de base (compatible Node.js)
import { brandingCore } from './branding-core';

// Imports des assets pour que Vite les bundle correctement
import logoUrl from "@assets/logo-cjd-social_1756108273665.jpg";
import boiteKiffImageUrl from "@assets/boite-kiff_1756106212980.jpeg";

// Configuration complète avec assets
export const branding = {
  ...brandingCore,
  
  // Assets (logos, icônes) - ajoutés uniquement dans le contexte browser
  assets: {
    logo: logoUrl,  // URL bundlée par Vite
    icon192: "/icon-192.jpg",  // Fichiers dans public/, pas bundlés
    icon512: "/icon-512.jpg",  // Fichiers dans public/, pas bundlés
    boiteKiffImage: boiteKiffImageUrl,  // URL bundlée par Vite
  },
} as const;

// Ré-export des types et helpers depuis branding-core
export type { BrandingCore, BrandingColors, BrandingFonts } from './branding-core';
export { getBrandColor, getAppName, getShortAppName, getOrgName } from './branding-core';

// Type pour la configuration complète avec assets
export type Branding = typeof branding;
