"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ShoppingBag, User, Menu, Package,
  ClipboardList, LogOut, Wrench, ArrowRight
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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import SignOutButton from "./SignOutButton";
import SearchBar from "./SearchBar";
import NavNotificationBell from "./NavNotificationBell";

const navLinks = [
  { href: "/equipment", label: "Equipment" },
  { href: "/packaging", label: "Packaging" },
  { href: "/why-roastandrecover", label: "Why us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

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
      className={`sticky top-0 z-40 w-full flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          : "bg-white border-b border-transparent"
      }`}
    >
      <Link
        href="/"
        className="font-display font-semibold text-base sm:text-lg text-char tracking-tight shrink-0 transition-opacity hover:opacity-90"
      >
        roast<span className="text-ember">&amp;</span>recover
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-1 text-sm font-medium">
        {navLinks.map((link) => {
          const active =
            pathname === link.href ||
            pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 transition-colors duration-150 ${
                active ? "text-char" : "text-ash hover:text-char"
              }`}
            >
              {link.label}
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute left-3 right-3 -bottom-px h-[2px] bg-ember rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search Bar */}
        <div className="hidden xs:block">
          <SearchBar />
        </div>
        
        {/* Packaging cart */}
        <Link href="/cart">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-char hover:text-ember hover:bg-steam rounded-lg h-9 w-9 sm:h-10 sm:w-10 transition-colors"
          >
            <ShoppingBag size={18} strokeWidth={1.75} />
            {packagingCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 bg-ember text-white text-[9px] font-bold flex items-center justify-center rounded-full leading-none">
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
            className="relative text-char hover:text-ember hover:bg-steam rounded-lg h-9 w-9 sm:h-10 sm:w-10 transition-colors"
          >
            <Wrench size={18} strokeWidth={1.75} />
            {equipmentCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 bg-graphite text-white text-[9px] font-bold flex items-center justify-center rounded-full leading-none">
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
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-steam transition-all">
                  <Avatar className="h-7 w-7 border border-gray-100">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback className="bg-steam text-ash text-xs">
                      <User size={14} />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-1 p-1 rounded-xl shadow-lg border-gray-100">
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/account" className="flex items-center gap-2">
                    <User size={14} className="text-ash" /> Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-2"
                  >
                    <ClipboardList size={14} className="text-ash" /> Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link
                    href="/account/equipment"
                    className="flex items-center gap-2"
                  >
                    <Package size={14} className="text-ash" /> Equipment
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-50" />
                <DropdownMenuItem className="text-red-600 focus:text-red-600 gap-2 rounded-lg cursor-pointer">
                  <LogOut size={14} />
                  <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="bg-ember text-white hover:bg-ember-dark rounded-lg text-xs font-semibold px-4 h-9">
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
              className="md:hidden text-char hover:bg-steam rounded-lg h-9 w-9 sm:h-10 sm:w-10"
            >
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          
          <SheetContent 
            side="right" 
            className="w-full h-full sm:max-w-none border-none bg-steam p-6 flex flex-col justify-between"
          >
            {/* Top Brand Marker + Search */}
            <div className="flex flex-col gap-6 mt-8">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-lg text-char tracking-tight">
                  roast<span className="text-ember">&amp;</span>recover
                </span>
              </div>

              <div className="xs:hidden w-full">
                <SearchBar />
              </div>

              {/* Main Navigation - Elegant Large Typography */}
              <div className="flex flex-col gap-1 mt-4">
                <p className="text-[10px] font-bold text-ash uppercase tracking-[0.2em] mb-3 px-1">Menu</p>
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="group py-3 text-2xl font-display font-medium text-char hover:text-ember active:text-ember transition-colors flex items-center justify-between"
                    >
                      {link.label}
                      <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-active:opacity-100 text-ember transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </div>

            {/* Bottom Account Controls */}
            <div className="border-t border-char/10 pt-6 pb-8 flex flex-col gap-5">
              {isSignedIn ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-1 mb-2">
                    <Avatar className="h-9 w-9 border border-char/10">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback className="bg-white text-char">
                        <User size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-char leading-none mb-1">{user?.fullName || "Account"}</p>
                      <p className="text-xs text-ash leading-none">Registered Member</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <SheetClose asChild>
                      <Link
                        href="/account"
                        className="flex items-center justify-center gap-2 bg-white hover:bg-white/80 border border-gray-200 text-char text-sm font-medium py-2.5 rounded-lg transition-colors"
                      >
                        <User size={14} className="text-ash" /> Details
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/account/orders"
                        className="flex items-center justify-center gap-2 bg-white hover:bg-white/80 border border-gray-200 text-char text-sm font-medium py-2.5 rounded-lg transition-colors"
                      >
                        <ClipboardList size={14} className="text-ash" /> Orders
                      </Link>
                    </SheetClose>
                  </div>

                  <div className="flex items-center justify-between bg-white/50 border border-gray-200/50 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                      <LogOut size={16} />
                      <SignOutButton />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-ash uppercase tracking-[0.2em] px-1">Portal</p>
                  <SheetClose asChild>
                    <Link
                      href="/sign-in"
                      className="w-full bg-ember hover:bg-ember-dark text-white text-center py-3.5 rounded-xl font-medium text-sm transition-all shadow-sm"
                    >
                      Sign in to your account
                    </Link>
                  </SheetClose>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}