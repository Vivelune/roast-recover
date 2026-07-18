"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";
// Import your icons here or pass them as children
export default function AdminSidebar({ children, links }: { children?: React.ReactNode, links: any[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-graphite px-5 py-4 shadow-md">
        <p className="text-sm uppercase tracking-wider font-bold text-white">roast&recover</p>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-300 hover:text-white p-1">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {mobileOpen && <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed md:sticky top-0 left-0 h-screen w-60 bg-graphite px-4 py-8 flex flex-col gap-1.5 z-50 transform md:transform-none transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-3 mb-6">
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400">roast&recover <span className="text-[10px] text-ember ml-1 font-mono">ADMIN</span></p>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400"><X size={18} /></button>
        </div>

        <nav className="space-y-1 overflow-y-auto flex-1 pr-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === href ? "bg-white/10 text-white font-semibold" : "text-gray-300 hover:text-white hover:bg-white/5"}`}>
              <Icon size={16} className={pathname === href ? "text-white" : "text-gray-400"} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}