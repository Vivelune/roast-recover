import { ClerkProvider } from "@clerk/nextjs";
import { interTight, dmSans } from "./fonts";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
    appearance={{
      variables: {
        colorPrimary: "#B5481F",
        borderRadius: "0.5rem",
        fontFamily: "var(--font-body)",
      },
      elements: {
        rootBox: "font-body",
        card: "bg-white border border-[#E5E5E5] shadow-none",
        headerTitle: "text-char font-display",
        headerSubtitle: "text-ash",
        formFieldLabel: "text-char",
        formFieldInput:
          "border-gray-300 focus:border-[#B5481F] focus:ring-[#B5481F]",
        footerActionLink: "text-[#B5481F]",
        formButtonPrimary:
          "bg-[#B5481F] hover:bg-[#9c3d1a] normal-case text-sm",
      },
    }}
    >
      <html lang="en" className={`${interTight.variable} ${dmSans.variable}`}>
        <body className="font-body text-char bg-white antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}