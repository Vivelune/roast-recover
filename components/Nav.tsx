// components/Nav.tsx
"use client";
import Link from "next/link";

import { useCart } from "@/lib/cart";
import { useUser } from "@clerk/nextjs";
import SignOutButton from "./SignOutButton";
import { ShoppingBag, User } from "lucide-react";


export default function Nav() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const { isSignedIn } = useUser();
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
      <Link href="/" className="font-display font-semibold text-lg text-char tracking-tight">
        Roast<span className="text-ember">&amp;</span>Recover
      </Link>

      <div className="hidden md:flex gap-8 text-sm text-ash">
        <Link href="/equipment" className="hover:text-char transition-colors">Equipment</Link>
        <Link href="/packaging" className="hover:text-char transition-colors">Packaging</Link>
        <Link href="/how-it-works" className="hover:text-char transition-colors">How it works</Link>
      </div>

      <div className="flex items-center gap-5">
        <Link href="/cart" className="relative flex items-center gap-1.5 text-sm text-char">
          <ShoppingBag size={18} strokeWidth={1.75} />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-ember text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
        {isSignedIn ? (
  <>
    <Link href="/account">Account</Link>
    <SignOutButton />
  </>
) : (
  <Link href="/sign-in">Sign in</Link>
)}
      </div>
    </nav>
  );
}