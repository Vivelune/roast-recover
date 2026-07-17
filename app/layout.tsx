import { ClerkProvider } from "@clerk/nextjs";
import { interTight, dmSans } from "./fonts";
import StoreHydration from "@/components/StoreHydration";
import PageTracker from "@/components/PageTracker";
import "./globals.css";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? "https://roastandrecover.com"),
    title: {
      default: "Roast & Recover — Certified Café Equipment, Direct from Source",
      template: "%s | Roast & Recover",
    },
    description:
      "Commercial espresso machines, grinders, and café packaging sourced direct from certified factories. UL/NSF certified, build-to-order, shipped to your café in the US.",
    keywords: [
      "commercial espresso machine",
      "café equipment supplier",
      "espresso machine direct source",
      "NSF certified espresso machine",
      "café packaging supplier",
      "coffee cups wholesale",
      "commercial grinder",
      "café supply chain",
      "direct from factory espresso",
    ],
    authors: [{ name: "Roast & Recover LLC" }],
    creator: "Roast & Recover LLC",
    publisher: "Roast & Recover LLC",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: process.env.NEXT_PUBLIC_URL,
      siteName: "Roast & Recover",
      title: "Roast & Recover — Certified Café Equipment, Direct from Source",
      description:
        "Commercial espresso machines, grinders, and café packaging sourced direct from certified factories. No distributor markup.",
      images: [
        {
          url: "/og-image.png", // TODO
          width: 1200,
          height: 630,
          alt: "Roast & Recover — Café Equipment Direct from Source",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Roast & Recover — Certified Café Equipment, Direct from Source",
      description:
        "Commercial espresso machines and café packaging, direct from certified factories.",
      images: ["/og-image.png"],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        { rel: "manifest", url: "/site.webmanifest" },
      ],
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