import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  // Base path pour le déploiement sur work.robinswood.io/cjd80
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === "development",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Chunking simplifié - éviter de casser les dépendances circulaires
          if (id.includes('node_modules')) {
            // PDF/Excel export (très lourd, lazy-loaded) - isoler en premier
            if (id.includes('/xlsx/') || id.includes('/jspdf/') || id.includes('/html2canvas/')) {
              return 'vendor-export';
            }
            // Rich text editor (lourd, souvent lazy-loaded)
            if (id.includes('/@tiptap/') || id.includes('/prosemirror')) {
              return 'vendor-editor';
            }
            // Charts (lourd)
            if (id.includes('/recharts/') || id.includes('/d3-')) {
              return 'vendor-charts';
            }
            // Tout le reste ensemble pour éviter les problèmes de dépendances
            // React, Radix, forms, router, etc. restent dans un seul chunk
          }
        },
      },
    },
  },
  server: {
    allowedHosts: ["all"],
    port: 5173,
    host: '0.0.0.0',
    hmr: {
      protocol: 'wss',
      host: 'cjd80-dev.robinswood.io',
      port: 443,
      clientPort: 443,
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
