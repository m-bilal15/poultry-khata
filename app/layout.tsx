import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { OfflineSyncProvider } from "@/components/OfflineSyncProvider";

export const metadata: Metadata = {
  title: "Safdar & Sons Poultry Traders",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ur" dir="rtl" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full">
        <OfflineSyncProvider />
        <OfflineBanner />
        <main className="max-w-lg mx-auto px-4 pt-4">
          {children}
        </main>
        <NavBar />
      </body>
    </html>
  );
}
