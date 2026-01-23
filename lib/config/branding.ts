// Next.js branding configuration with assets
// Extends core branding config with asset paths for Next.js public directory
import { brandingCore } from './branding-core';

// For Next.js, we use public paths instead of Vite bundled paths
export const branding = {
  ...brandingCore,

  // Assets (logos, icônes) - using public paths for Next.js
  assets: {
    logo: "/logo-cjd.png",
    icon192: "/icon-192.jpg",
    icon512: "/icon-512.jpg",
    boiteKiffImage: "/boite-kiff.jpeg",
  },
} as const;

// Re-export types and helpers
export type { BrandingCore, BrandingColors, BrandingFonts } from './branding-core';
export { getBrandColor, getAppName, getShortAppName, getOrgName } from './branding-core';

// Type for complete configuration with assets
export type Branding = typeof branding;
