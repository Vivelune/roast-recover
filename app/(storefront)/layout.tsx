import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import ReferralCapture from "@/components/ReferralCapture";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <main className="min-h-screen">{children}</main>
      {/* <Footer /> */}
    </>
  );
}