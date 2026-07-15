import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, Wrench, RefreshCw, MapPin, Building2, Gift, BarChart2 } from "lucide-react";

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
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-[#FAFAF9] px-4 py-8 gap-1 shrink-0">
        <p className="text-xs uppercase tracking-wide text-ash px-3 mb-3">
          My account
        </p>
        {sideLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-ash hover:text-char hover:bg-steam/60 transition-colors"
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 px-6 md:px-10 py-10 max-w-4xl">
        {children}
      </main>
    </div>
  );
}