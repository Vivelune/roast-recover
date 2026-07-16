"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Package,
  ShieldCheck, Users, Factory, MessageSquare, Star, WrenchIcon, FileText, BarChart2, Menu, X
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9F9F8]">
      {/* Mobile Sticky Top Header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-graphite px-5 py-4 shadow-md">
        <p className="text-sm uppercase tracking-wider font-bold text-white">
          roast&amp;recover
        </p>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-300 hover:text-white p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop and Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-60 bg-graphite px-4 py-8 flex flex-col gap-1.5 shrink-0 z-50 transform md:transform-none transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-3 mb-6">
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
            roast&amp;recover <span className="text-[10px] text-ember ml-1 font-mono">ADMIN</span>
          </p>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1 overflow-y-auto flex-1 pr-1">
          {adminLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} className={isActive ? "text-white" : "text-gray-400 group-hover:text-white"} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Container */}
      <main className="flex-1 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}