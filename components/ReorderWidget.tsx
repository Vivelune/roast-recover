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
      <p className="text-sm font-medium text-char mb-3 flex items-center gap-2">
        <RefreshCw size={15} className="text-ember" />
        Reorder intelligence
      </p>
      <div className="space-y-2.5">
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
      className={`border rounded-lg p-4 flex items-center gap-4 ${
        insight.isLow
          ? "border-amber-300 bg-amber-50/30"
          : "border-border bg-white"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-10 h-10 rounded-md bg-steam flex-shrink-0 overflow-hidden">
        {insight.image ? (
          <Image src={insight.image} alt={insight.productName} fill className="object-cover" sizes="40px" />
        ) : (
          <div className="w-full h-full bg-steam" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-char truncate">
            {insight.productName}
          </p>
          {insight.isLow && (
            <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
              <AlertTriangle size={10} /> Running low
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
          <div
            className={`h-1.5 rounded-full transition-all ${
              pct >= 85 ? "bg-amber-400" : "bg-ember"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-xs text-ash flex items-center gap-1">
          <Clock size={10} />
          {daysLeft > 0
            ? `~${daysLeft} days until you typically reorder`
            : `${Math.abs(daysLeft)} days overdue for reorder`}
          {" · "}
          every ~{insight.avgIntervalDays} days
        </p>
      </div>

      {/* Reorder button */}
      <button
        onClick={handleReorder}
        disabled={loading}
        className="flex-shrink-0 bg-ember hover:bg-ember-dark disabled:opacity-60 text-white text-xs px-3.5 py-2 rounded-md font-medium transition-colors flex items-center gap-1.5"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <RefreshCw size={12} />
        )}
        Reorder ×{insight.lastQuantity}
      </button>
    </div>
  );
}