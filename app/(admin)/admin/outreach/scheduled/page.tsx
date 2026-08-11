// app/admin/outreach/scheduled/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail, X } from "lucide-react";

interface ScheduledEmail {
  id: string;
  subject: string;
  scheduledAt: string;
  campaign: { name: string } | null;
  lead: { company: string | null; email: string; name: string | null };
}

function timeUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Due now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `in ${days}d ${hours % 24}h`;
  return `in ${hours}h`;
}

export default function ScheduledQueuePage() {
  const [items, setItems] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/outreach/scheduled");
    const data = await res.json();
    setItems(data.scheduled);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(id: string) {
    setCancelling(id);
    await fetch(`/api/admin/outreach/scheduled/${id}/cancel`, { method: "POST" });
    setCancelling(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
          Scheduled Queue
        </h1>
        <p className="text-xs sm:text-sm text-ash mt-1">
          {items.length} email{items.length !== 1 ? "s" : ""} waiting to send
        </p>
      </div>

      <Card className="p-5 border-gray-150">
        {loading ? (
          <p className="text-sm text-ash py-8 text-center">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-ash py-8 text-center">Nothing currently scheduled.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-steam/40 text-ash shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-char truncate">
                      {item.lead.company ?? item.lead.email}
                    </p>
                    <p className="text-[11px] text-ash truncate">{item.subject}</p>
                    {item.campaign && (
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {item.campaign.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-char flex items-center gap-1 justify-end">
                      <Clock size={11} />
                      {timeUntil(item.scheduledAt)}
                    </p>
                    <p className="text-[10px] text-ash mt-0.5">
                      {new Date(item.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancel(item.id)}
                    disabled={cancelling === item.id}
                    className="p-1.5 rounded-lg text-ash hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Cancel this scheduled email"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}