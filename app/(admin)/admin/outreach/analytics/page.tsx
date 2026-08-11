// app/admin/outreach/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import OpensChart from "@/components/admin/OpensChart";
import { Mail, Eye, MousePointerClick, MessageSquare, TrendingUp } from "lucide-react";

interface AnalyticsData {
  totalLeads: number;
  statusMap: Record<string, number>;
  funnel: { sent: number; opened: number; clicked: number; replied: number; converted: number };
  opensByDay: { date: string; opens: number }[];
  campaignStats: { id: string; name: string; sent: number; opened: number; clicked: number; openRate: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/admin/outreach/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-ash">Loading...</p>;

  const stats = [
    { label: "Total leads", value: data.totalLeads, icon: Mail },
    { label: "Sent", value: data.funnel.sent, icon: Mail },
    { label: "Opened", value: data.funnel.opened, icon: Eye },
    { label: "Clicked", value: data.funnel.clicked, icon: MousePointerClick },
    { label: "Replied", value: data.funnel.replied, icon: MessageSquare },
  ];

  const funnelSteps = [
    { label: "Sent", value: data.funnel.sent },
    { label: "Opened", value: data.funnel.opened },
    { label: "Clicked", value: data.funnel.clicked },
    { label: "Replied", value: data.funnel.replied },
    { label: "Converted", value: data.funnel.converted },
  ];
  const maxFunnel = Math.max(...funnelSteps.map((s) => s.value), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
          Outreach Analytics
        </h1>
        <p className="text-xs sm:text-sm text-ash mt-1">
          Opens, clicks, and reply performance across all campaigns.
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

      {/* Opens over time */}
      <Card className="p-5 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <p className="text-sm font-semibold text-char">Opens Over Time</p>
            <p className="text-[11px] text-ash mt-0.5">Last 14 days</p>
          </div>
        </div>
        <div className="h-60 w-full">
          <OpensChart data={data.opensByDay} />
        </div>
      </Card>

      {/* Funnel */}
      <Card className="p-5 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-steam/40 text-ash">
            <TrendingUp size={15} />
          </div>
          <p className="text-sm font-semibold text-char">Conversion Funnel</p>
        </div>
        <div className="space-y-3">
          {funnelSteps.map((step) => (
            <div key={step.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-char">{step.label}</span>
                <span className="text-ash">{step.value}</span>
              </div>
              <div className="h-2 rounded-full bg-steam/40 overflow-hidden">
                <div
                  className="h-full bg-ember rounded-full transition-all duration-500"
                  style={{ width: `${(step.value / maxFunnel) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Campaign breakdown */}
      <Card className="p-5 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <p className="text-sm font-semibold text-char mb-5">By Campaign</p>
        {data.campaignStats.length === 0 ? (
          <p className="text-sm text-ash py-8 text-center">No campaigns yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="min-w-full text-xs sm:text-sm divide-y divide-gray-100">
              <thead>
                <tr className="text-[11px] text-ash uppercase tracking-wider text-left">
                  <th className="pb-3 font-semibold">Campaign</th>
                  <th className="pb-3 font-semibold text-right">Sent</th>
                  <th className="pb-3 font-semibold text-right">Opened</th>
                  <th className="pb-3 font-semibold text-right">Clicked</th>
                  <th className="pb-3 font-semibold text-right">Open rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {data.campaignStats.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3.5 font-medium text-char">{c.name}</td>
                    <td className="py-3.5 text-right text-ash">{c.sent}</td>
                    <td className="py-3.5 text-right text-ash">{c.opened}</td>
                    <td className="py-3.5 text-right text-ash">{c.clicked}</td>
                    <td className="py-3.5 text-right font-semibold text-char">{c.openRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}