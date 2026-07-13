import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="min-h-screen">{children}</main>
      {/* <Footer /> */}
    </>
  );
}