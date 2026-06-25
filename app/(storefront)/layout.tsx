import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { CartProvider } from "@/lib/cart";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Nav />
      {children}
      
    </CartProvider>
  );
}