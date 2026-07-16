import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, ClipboardList, Package,
  ShieldCheck, Users, Factory, MessageSquare, Star, WrenchIcon, FileText, BarChart2,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/certifications", label: "Certifications", icon: ShieldCheck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/batches", label: "Production", icon: Factory },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/service", label: "Service", icon: WrenchIcon },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-56 bg-graphite px-4 py-8 gap-1 shrink-0">
        <p className="text-xs uppercase tracking-wide text-gray-400 px-3 mb-3">
          roast&amp;recover
        </p>
        {adminLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 bg-[#F9F9F8] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}