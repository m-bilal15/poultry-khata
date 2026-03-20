import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OfflineSyncProvider } from "@/components/OfflineSyncProvider";
import { LangToggle } from "@/components/LangToggle";
import { RootClient } from "@/components/RootClient";

export const metadata: Metadata = {
  title: "صفدر اینڈ سنز — Poultry Khata",
  description: "Daily khata, udhaar, and restaurant management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Poultry Khata",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
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
      <body className="min-h-full">
        <RootClient />
        <OfflineSyncProvider />
        <OfflineBanner />
        {/* Language toggle — always visible top-right */}
        <div className="fixed top-3 left-3 z-50">
          <LangToggle />
        </div>
        <main className="max-w-lg mx-auto px-4 pt-5">
          {children}
        </main>
        <NavBar />
      </body>
    </html>
  );
}
