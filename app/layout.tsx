import type { Metadata, Viewport } from 'next';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import { OfflineBanner } from '@/components/OfflineBanner';
import { OfflineSyncProvider } from '@/components/OfflineSyncProvider';
import { LangToggle } from '@/components/LangToggle';
import { RootClient } from '@/components/RootClient';

export const metadata: Metadata = {
  title: 'Safdar & Sons — Poultry Khata',
  description: 'Daily khata, udhaar, and restaurant management for Safdar & Sons Poultry Traders',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Poultry Khata',
  },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ur" dir="rtl" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="h-full">
        <RootClient />
        <OfflineSyncProvider />
        <OfflineBanner />

        {/* Sidebar (desktop) + Bottom nav (mobile) */}
        <NavBar />

        {/* Mobile top header */}
        <header
          className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white z-40 flex items-center justify-between px-4"
          style={{ borderBottom: '1px solid #f0f0f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
        >
          <LangToggle />
          <span className="font-bold text-gray-700 text-sm">Poultry Khata</span>
          {/* balance spacer */}
          <div className="w-20" />
        </header>

        {/* Main content */}
        <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-10 min-h-full">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
