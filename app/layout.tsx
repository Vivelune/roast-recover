import { ClerkProvider } from "@clerk/nextjs";
import { interTight, dmSans } from "./fonts";
import StoreHydration from "@/components/StoreHydration";
import "./globals.css";

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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}