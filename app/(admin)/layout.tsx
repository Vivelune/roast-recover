import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LayoutDashboard, ClipboardList, Package, ShieldCheck, Users, Factory, MessageSquare, Star, WrenchIcon, FileText, BarChart2 } from "lucide-react";

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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Defensive fallback check
  if (!user || user.role !== "ADMIN") {
    redirect("/account");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9F9F8]">
      <AdminSidebar links={adminLinks} />
      
      <main className="flex-1 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}