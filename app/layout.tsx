import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { brandingCore } from '@/lib/config/branding-core';

const inter = Inter({ subsets: ['latin'] });

// Next.js 16: viewport is now separate from metadata
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: brandingCore.colors.primary,
};

export const metadata: Metadata = {
  title: 'CJD Amiens - Boîte à Kiffs',
  description: 'Application collaborative pour le CJD Amiens',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-cjd.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
