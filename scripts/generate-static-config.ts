import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// Note: Import with .js extension even though source is .ts (TypeScript/ESM convention)
import { brandingCore, getAppName, getShortAppName } from '../client/src/config/branding-core.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateIndexHtml() {
  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>${getAppName()}</title>
    <meta name="description" content="${brandingCore.app.description}" />
    
    <!-- Empêcher l'indexation par les moteurs de recherche -->
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
    <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
    
    <!-- Disable cache in development -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    
    <!-- PWA Meta Tags -->
    <meta name="application-name" content="${getShortAppName()}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="${getShortAppName()}">
    <meta name="format-detection" content="telephone=no">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="msapplication-config" content="/browserconfig.xml">
    <meta name="msapplication-TileColor" content="${brandingCore.pwa.themeColor}">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="theme-color" content="${brandingCore.pwa.themeColor}">
    
    <!-- PWA Icons -->
    <link rel="apple-touch-icon" href="/icon-192.jpg">
    <link rel="icon" type="image/jpeg" href="/icon-192.jpg">
    <link rel="manifest" href="/manifest.json">
    <link rel="mask-icon" href="/icon-192.jpg" color="${brandingCore.pwa.themeColor}">
    <link rel="shortcut icon" href="/icon-192.jpg">
    
    <!-- Fonts avec optimisation PWA -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${brandingCore.fonts.googleFontsUrl}" rel="stylesheet">
    
    <!-- Open Graph pour partage social -->
    <meta property="og:type" content="${brandingCore.social.ogType}">
    <meta property="og:title" content="${getAppName()}">
    <meta property="og:description" content="${brandingCore.app.description}">
    <meta property="og:site_name" content="${getShortAppName()}">
    <meta property="og:url" content="${brandingCore.organization.url}">
    <meta property="og:image" content="/icon-512.jpg">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="${brandingCore.social.twitterCard}">
    <meta name="twitter:title" content="${getAppName()}">
    <meta name="twitter:description" content="${brandingCore.app.description}">
    <meta name="twitter:image" content="/icon-512.jpg">
  </head>
  <body>
    <div id="root"></div>
    <!-- Auto cache busting -->
    <script>
      // Force reload service worker on each page load to see changes immediately
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.update();
        });
        
        // Ne pas clearer les caches automatiquement - cause des problèmes de performance
      }
    </script>
    <script type="module" src="/src/main.tsx"></script>
    <!-- This is a replit script which adds a banner on the top of the page when opened in development mode outside the replit environment -->
    <script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
  </body>
</html>
`;
}

function generateManifest() {
  const manifest = {
    name: getAppName(),
    short_name: getShortAppName(),
    description: brandingCore.app.description,
    theme_color: brandingCore.pwa.themeColor,
    background_color: brandingCore.pwa.backgroundColor,
    display: brandingCore.pwa.display,
    scope: "/",
    start_url: "/",
    id: "cjd-amiens-boite-kiffs",
    orientation: brandingCore.pwa.orientation,
    categories: brandingCore.pwa.categories,
    lang: brandingCore.pwa.lang,
    dir: "ltr",
    display_override: ["standalone", "minimal-ui", "browser"],
    icons: [
      {
        src: "/icon-192.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any"
      },
      {
        src: "/icon-512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any"
      },
      {
        src: "/icon-512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable"
      }
    ],
    shortcuts: [
      {
        name: "Voter pour des idées",
        short_name: "Voter",
        description: "Consulter et voter pour les idées proposées par la communauté",
        url: "/?tab=ideas",
        icons: [{ src: "/icon-192.jpg", sizes: "192x192" }]
      },
      {
        name: "Proposer une idée",
        short_name: "Proposer",
        description: "Soumettre une nouvelle idée à la communauté",
        url: "/?tab=propose",
        icons: [{ src: "/icon-192.jpg", sizes: "192x192" }]
      },
      {
        name: "Événements CJD",
        short_name: "Événements",
        description: "Découvrir et s'inscrire aux événements",
        url: "/?tab=events",
        icons: [{ src: "/icon-192.jpg", sizes: "192x192" }]
      },
      {
        name: "Administration",
        short_name: "Admin",
        description: "Interface d'administration (réservée)",
        url: "/?tab=admin",
        icons: [{ src: "/icon-192.jpg", sizes: "192x192" }]
      }
    ],
    prefer_related_applications: false,
    edge_side_panel: {
      preferred_width: 400
    }
  };

  return JSON.stringify(manifest, null, 2);
}

function main() {
  const projectRoot = join(__dirname, '..');
  
  const indexHtmlPath = join(projectRoot, 'client/index.html');
  const manifestPath = join(projectRoot, 'client/public/manifest.json');
  
  const indexHtml = generateIndexHtml();
  const manifest = generateManifest();
  
  writeFileSync(indexHtmlPath, indexHtml, 'utf-8');
  console.log('✅ Generated client/index.html');
  
  writeFileSync(manifestPath, manifest, 'utf-8');
  console.log('✅ Generated client/public/manifest.json');
  
  console.log('\n🎉 Static configuration files generated successfully!');
  console.log(`   - Title: ${getAppName()}`);
  console.log(`   - Short Name: ${getShortAppName()}`);
  console.log(`   - Theme Color: ${brandingCore.pwa.themeColor}`);
}

main();
