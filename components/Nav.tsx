"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ShoppingBag, User, Menu, Package,
  ClipboardList, LogOut, Wrench,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useEquipmentCart } from "@/lib/equipment-cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SignOutButton from "./SignOutButton";

const navLinks = [
  { href: "/equipment", label: "Equipment" },
  { href: "/packaging", label: "Packaging" },
  { href: "/how-it-works", label: "How it works" },
];

export default function Nav() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  // ✅ hooks inside the component, not outside
  const packagingCount = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const equipmentCount = useEquipmentCart((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 py-4 transition-all ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]"
          : "bg-white border-b border-transparent"
      }`}
    >
      <Link
        href="/"
        className="font-display font-semibold text-lg text-char tracking-tight"
      >
        roast<span className="text-ember">&amp;</span>recover
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-1 text-sm">
        {navLinks.map((link) => {
          const active =
            pathname === link.href ||
            pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 transition-colors ${
                active ? "text-char" : "text-ash hover:text-char"
              }`}
            >
              {link.label}
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-ember rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-1">
        {/* Packaging cart */}
        <Link href="/cart">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-char hover:text-ember"
          >
            <ShoppingBag size={18} strokeWidth={1.75} />
            {packagingCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-ember text-white text-[10px] leading-none">
                {packagingCount}
              </Badge>
            )}
          </Button>
        </Link>

        {/* Equipment cart */}
        <Link href="/equipment/cart">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-char hover:text-ember"
          >
            <Wrench size={18} strokeWidth={1.75} />
            {equipmentCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-graphite text-white text-[10px] leading-none">
                {equipmentCount}
              </Badge>
            )}
          </Button>
        </Link>

        {/* Account dropdown — desktop only */}
        <div className="hidden md:block ml-1">
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback className="bg-steam text-ash text-xs">
                      <User size={14} />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-2">
                    <User size={14} /> Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-2"
                  >
                    <ClipboardList size={14} /> Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/account/equipment"
                    className="flex items-center gap-2"
                  >
                    <Package size={14} /> Equipment
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600 gap-2">
                  <LogOut size={14} />
                  <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="bg-ember hover:bg-ember-dark">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-char"
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-1 mt-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2 py-3 text-base text-char border-b border-gray-100"
                >
                  {link.label}
                </Link>
              ))}
              {isSignedIn ? (
                <>
                  <Link
                    href="/account"
                    className="px-2 py-3 text-base text-char border-b border-gray-100"
                  >
                    Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="px-2 py-3 text-base text-char border-b border-gray-100"
                  >
                    Orders
                  </Link>
                  <div className="px-2 py-3">
                    <SignOutButton />
                  </div>
                </>
              ) : (
                <Link
                  href="/sign-in"
                  className="px-2 py-3 text-base text-ember font-medium"
                >
                  Sign in
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}