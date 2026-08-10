// app/admin/outreach/page.tsx
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Upload,
  PenSquare,
  Users,
  BarChart3,
  ArrowRight,
  Mail,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OutreachHubPage() {
  const [total, newCount, contacted, opened, replied] = await Promise.all([
    prisma.outreach.count(),
    prisma.outreach.count({ where: { status: "NEW" } }),
    prisma.outreach.count({ where: { status: "CONTACTED" } }),
    prisma.outreach.count({ where: { status: "OPENED" } }),
    prisma.outreach.count({ where: { status: "REPLIED" } }),
  ]);

  const stats = [
    { label: "Total leads", value: total, icon: Users },
    { label: "New", value: newCount, icon: Users },
    { label: "Contacted", value: contacted, icon: Mail },
    { label: "Opened", value: opened, icon: Mail, alert: false },
    { label: "Replied", value: replied, icon: Mail },
  ];

  const actions = [
    {
      href: "/admin/outreach/compose",
      label: "Compose",
      description: "Write and send an email to selected leads",
      icon: PenSquare,
    },
    {
      href: "/admin/outreach/import",
      label: "Import leads",
      description: "Upload a CSV of new leads",
      icon: Upload,
    },
    {
      href: "/admin/outreach/leads",
      label: "All leads",
      description: "View, filter, and manage every lead",
      icon: Users,
    },
    {
      href: "/admin/outreach/analytics",
      label: "Analytics",
      description: "Opens, clicks, and reply rates by campaign",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
          Outreach
        </h1>
        <p className="text-xs sm:text-sm text-ash mt-1">
          Manage leads, send emails, and track engagement.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5 flex flex-col justify-between border-gray-150">
            <div className="p-2 rounded-lg bg-steam/40 text-ash w-fit mb-4">
              <Icon size={16} />
            </div>
            <p className="font-display font-bold text-2xl sm:text-3xl text-char tracking-tight">
              {value}
            </p>
            <p className="text-xs font-semibold text-char mt-3">{label}</p>
          </Card>
        ))}
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="block group">
            <Card className="p-5 h-full border-gray-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-lg bg-steam/40 text-ash mb-4">
                  <Icon size={18} />
                </div>
                <ArrowRight size={14} className="text-ash/40 group-hover:text-ember transition-colors" />
              </div>
              <p className="text-sm font-semibold text-char">{label}</p>
              <p className="text-[11px] text-ash/80 mt-1">{description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}