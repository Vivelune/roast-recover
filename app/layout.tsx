import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { interTight, dmSans } from "./fonts";
import StoreHydration from "@/components/StoreHydration";
import PageTracker from "@/components/PageTracker";
import "./globals.css";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";

const BASE_URL =
  process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Roast & Recover — Certified Café Equipment, Direct from Source",
    template: "%s — Roast & Recover",
  },

  description:
    "Commercial espresso machines, grinders, and packaging for independent cafés. Factory-direct pricing, UL/NSF certified, shipped to your door.",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Roast & Recover",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#B5481F",
          colorBackground: "#ffffff",
          borderRadius: "0.5rem",
          fontFamily: "var(--font-body)",
        },
        elements: {
          card: "shadow-none border border-gray-200",
          formButtonPrimary: "normal-case text-sm",
        },
      }}
    >
      <html lang="en" className={`${interTight.variable} ${dmSans.variable}`}>
        <body className="font-body text-char bg-white antialiased">
          <StoreHydration />

          <Suspense fallback={null}>
            <PageTracker />
          </Suspense>

          {children}

          <Analytics />
          <SpeedInsights />

          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}