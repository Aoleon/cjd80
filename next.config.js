/**
 * Next.js 16.1.4 Configuration
 * Migrated from Next.js 15.1.4 on 2026-01-23
 *
 * Breaking changes applied:
 * - Turbopack is now default for dev/build (no --turbo flag needed)
 * - middleware.ts renamed to proxy.ts
 * - experimental.typedRoutes promoted to stable
 * - Using --webpack flag for build due to custom webpack config
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Monorepo - Backend NestJS séparé sur port 5001
  output: 'standalone',

  // TypeScript strict
  typescript: {
    ignoreBuildErrors: false,
  },

  // Next.js 16: Turbopack config (moved from experimental)
  // Note: Turbopack is default in dev, but we use webpack for build
  // due to custom webpack configuration below
  turbopack: {
    // Turbopack-specific options if needed
  },

  // Experimental features (Next.js 16)
  experimental: {
    // typedRoutes is now stable in Next.js 16
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Next.js 16: typedRoutes promoted from experimental
  typedRoutes: true,

  // Images optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'dev_minio',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cjd80.rbw.ovh',
        pathname: '/**',
      },
    ],
    // Next.js 16: Restore old cache TTL behavior if needed
    // minimumCacheTTL: 60,
  },

  // Rewrites pour backend NestJS
  async rewrites() {
    return [
      // tRPC endpoint - proxifié vers NestJS
      {
        source: '/api/trpc/:path*',
        destination: 'http://localhost:5001/api/trpc/:path*',
      },
      // OAuth callback géré par NestJS
      {
        source: '/api/auth/authentik/callback',
        destination: 'http://localhost:5001/api/auth/authentik/callback',
      },
      // Autres routes API NestJS si besoin
      {
        source: '/api/webhooks/:path*',
        destination: 'http://localhost:5001/api/webhooks/:path*',
      },
    ];
  },

  // Webpack config pour support de certains packages
  // Note: Pour utiliser Turbopack en build, supprimer cette section
  // et utiliser `next build --turbopack`
  // Avec cette config webpack, utiliser `next build --webpack`
  webpack: (config, { isServer }) => {
    config.externals = [...(config.externals || []), 'bufferutil', 'utf-8-validate'];

    // Exclude client/src from compilation except when explicitly imported
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Prevent Webpack from trying to resolve client/src imports
        '@/client/src': false,
      };
    }

    return config;
  },

  // Désactiver x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;
