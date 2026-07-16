"use client";
import { useState } from "react";
import { RefreshCw, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { createReorderSession } from "@/app/actions/reorder";
import type { ReorderInsight } from "@/lib/reorder";
import Image from "next/image";

export default function ReorderWidget({
  insights,
  defaultAddressId,
}: {
  insights: ReorderInsight[];
  defaultAddressId: string | null;
}) {
  if (insights.length === 0) return null;

  return (
    <div className="mb-8">
      <p className="text-xs font-bold text-char uppercase tracking-wider mb-3.5 flex items-center gap-2">
        <RefreshCw size={14} className="text-ember animate-spin-slow" />
        Reorder intelligence
      </p>
      <div className="space-y-3">
        {insights.map((insight) => (
          <ReorderRow
            key={insight.productId}
            insight={insight}
            defaultAddressId={defaultAddressId}
          />
        ))}
      </div>
    </div>
  );
}

function ReorderRow({
  insight,
  defaultAddressId,
}: {
  insight: ReorderInsight;
  defaultAddressId: string | null;
}) {
  const [loading, setLoading] = useState(false);

  async function handleReorder() {
    if (!defaultAddressId) {
      window.location.href = "/account/addresses";
      return;
    }
    setLoading(true);
    try {
      const { checkoutUrl } = await createReorderSession(
        insight.productId,
        insight.lastQuantity,
        defaultAddressId
      );
      window.location.href = checkoutUrl;
    } finally {
      setLoading(false);
    }
  }

  const daysLeft = insight.avgIntervalDays - insight.daysSinceLastOrder;
  const pct = Math.min(
    100,
    Math.round((insight.daysSinceLastOrder / insight.avgIntervalDays) * 100)
  );

  return (
    <div
      className={`border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-200 ${
        insight.isLow
          ? "border-amber-200 bg-amber-50/20 shadow-[0_2px_12px_rgba(245,158,11,0.03)]"
          : "border-gray-150 bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)]"
      }`}
    >
      {/* Thumbnail + Core Details wrapper */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="relative w-12 h-12 rounded-lg bg-steam border border-gray-100 flex-shrink-0 overflow-hidden shadow-sm">
          {insight.image ? (
            <Image src={insight.image} alt={insight.productName} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="w-full h-full bg-steam" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-char truncate max-w-[180px] sm:max-w-none">
              {insight.productName}
            </p>
            {insight.isLow && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full flex-shrink-0">
                <AlertTriangle size={10} /> Low
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-steam rounded-full h-1.5 mb-1.5 max-w-sm">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                pct >= 85 ? "bg-amber-500" : "bg-ember"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="text-xs text-ash flex items-center gap-1.5">
            <Clock size={12} className="text-ash/60 shrink-0" />
            <span className="truncate">
              {daysLeft > 0
                ? `~${daysLeft} days until you typically reorder`
                : `${Math.abs(daysLeft)} days overdue`}
              {" · "}
              every ~{insight.avgIntervalDays} days
            </span>
          </p>
        </div>
      </div>

      {/* Reorder Button: Full width on mobile, inline auto-width on desktop */}
      <button
        onClick={handleReorder}
        disabled={loading}
        className="w-full sm:w-auto flex-shrink-0 bg-char hover:bg-char/90 active:scale-[0.98] disabled:opacity-60 text-white text-xs px-4 py-2.5 sm:py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <RefreshCw size={13} />
        )}
        Reorder ×{insight.lastQuantity}
      </button>
    </div>
  );
}