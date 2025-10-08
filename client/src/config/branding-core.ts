// Configuration centralisée du branding/thème de l'application
// Personnalisez ces valeurs pour adapter l'application à votre organisation
// Ce fichier contient la configuration pure sans imports d'assets, utilisable par Node.js

export const brandingCore = {
  // Informations de base
  organization: {
    name: "CJD Amiens",
    fullName: "Centre des Jeunes Dirigeants d'Amiens",
    tagline: "Application collaborative pour le partage d'idées et la gestion d'événements",
    url: "https://votre-domaine.com",
    email: "contact@cjd-amiens.fr",
  },

  // Application
  app: {
    name: "CJD Amiens - Boîte à Kiffs",
    shortName: "CJD Amiens",
    description: "Application interne du Centre des Jeunes Dirigeants d'Amiens pour la gestion collaborative d'idées et d'événements",
    ideaBoxName: "Boîte à Kiffs", // Nom de la fonctionnalité de partage d'idées
  },

  // Couleurs du thème (format hexadécimal)
  colors: {
    primary: "#00a844",      // Couleur principale (vert CJD)
    primaryDark: "#008835",  // Variante sombre
    primaryLight: "#00c94f", // Variante claire
    secondary: "#1a1a1a",    // Couleur secondaire
    background: "#f9fafb",   // Fond de l'application
  },

  // Typographie
  fonts: {
    primary: "Lato",         // Police principale
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap",
    weights: [300, 400, 700, 900],
  },

  // Métadonnées PWA
  pwa: {
    themeColor: "#00a844",
    backgroundColor: "#f9fafb",
    display: "standalone",
    orientation: "portrait-primary",
    categories: ["business", "productivity", "social"],
    lang: "fr-FR",
  },

  // Réseaux sociaux / Open Graph
  social: {
    ogType: "website",
    twitterCard: "summary",
  },

  // Liens externes
  links: {
    website: "https://cjd-amiens.fr",
    support: "mailto:support@cjd-amiens.fr",
  },
} as const;

// Types dérivés pour TypeScript
export type BrandingCore = typeof brandingCore;
export type BrandingColors = typeof brandingCore.colors;
export type BrandingFonts = typeof brandingCore.fonts;

// Helpers pour accéder à la configuration
export const getBrandColor = (colorName: keyof BrandingColors) => brandingCore.colors[colorName];
export const getAppName = () => brandingCore.app.name;
export const getShortAppName = () => brandingCore.app.shortName;
export const getOrgName = () => brandingCore.organization.name;
