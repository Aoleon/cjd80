import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server/src/main.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  clean: false,
  dts: false,
  tsconfig: 'tsconfig.server.json',
  external: [
    './vite.config.js',
    '../vite.config.js',
  ],
  skipNodeModulesBundle: true,
  // Utiliser SWC au lieu d'esbuild pour le support des décorateurs
  esbuildOptions(options) {
    options.keepNames = true;
    // Forcer la conversion des imports CommonJS
    options.mainFields = ['module', 'main'];
  },
  banner: {
    js: `import "reflect-metadata";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);`,
  },
});

