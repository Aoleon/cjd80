import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      '@': './client/src',
      '@shared': './shared',
      '@assets': './attached_assets',
    },
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    };
    return config;
  },

  output: 'standalone',

  // API proxy vers backend NestJS
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      // OAuth callbacks Authentik
      {
        source: '/auth/:path*',
        destination: `${backendUrl}/auth/:path*`,
      },
    ];
  },

  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // PWA will be handled separately with next-pwa
};

export default nextConfig;
