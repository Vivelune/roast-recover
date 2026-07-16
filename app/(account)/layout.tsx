import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, Wrench, RefreshCw, MapPin, Building2, Gift, BarChart2 } from "lucide-react";
import { Suspense } from "react";
import NavNotificationBell from "@/components/NavNotificationBell";

const sideLinks = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: ClipboardList },
  { href: "/account/equipment", label: "Equipment", icon: Wrench },
  { href: "/account/company", label: "Company", icon: Building2 },
  { href: "/account/subscriptions", label: "Subscriptions", icon: RefreshCw },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/referrals", label: "Referrals", icon: Gift },
  { href: "/account/analytics", label: "Analytics", icon: BarChart2 },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAFAF9]">
      
      {/* Desktop Left Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-[#FAFAF9] px-4 py-8 gap-1 shrink-0 h-screen sticky top-0">
        <div className="flex items-center justify-between px-3 mb-6">
          <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">Account</p>
          <Suspense fallback={<div className="w-8 h-8 rounded-full bg-steam/50 animate-pulse" />}>
            <NavNotificationBell />
          </Suspense>
        </div>
        <nav className="space-y-1">
          {sideLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ash hover:text-char hover:bg-steam/60 transition-colors"
            >
              <Icon size={16} className="text-ash/70" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Sticky Top Header & Swipeable Nav */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-white border-b border-border">
        <div className="px-5 py-3 flex items-center justify-between">
          <p className="text-sm font-bold text-char tracking-tight">My Account</p>
          <Suspense fallback={<div className="w-8 h-8 rounded-full bg-steam/50 animate-pulse" />}>
            <NavNotificationBell />
          </Suspense>
        </div>
        
        {/* Horizontal Nav Scrollbar for Mobile */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 pb-3 pt-1 scrollbar-none">
          {sideLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap bg-steam/40 text-ash active:bg-steam border border-transparent transition-all shrink-0"
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content Container */}
      <main className="flex-1 bg-white px-4 sm:px-8 md:px-12 py-8 md:py-12 w-full max-w-4xl">
        {children}
      </main>
    </div>
  );
}