"use client";
import { useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

const MACHINE_TYPE_LABELS: Record<string, string> = {
  espresso: "Espresso machines",
  grinder: "Grinders",
  "batch-brew": "Batch brewers",
  accessories: "Accessories",
};

export default function EquipmentFilters({
  machineTypes,
  maxProductPrice,
  maxProductLead,
  activeType,
  activeMaxPrice,
  activeMaxLeadTime,
  activeFilterCount,
}: {
  machineTypes: string[];
  maxProductPrice: number;
  maxProductLead: number;
  activeType?: string;
  activeMaxPrice?: string;
  activeMaxLeadTime?: string;
  activeFilterCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function applyFilter(key: string, value: string | null) {
    const params = new URLSearchParams();
    if (activeType && key !== "type") params.set("type", activeType);
    if (activeMaxPrice && key !== "maxPrice") params.set("maxPrice", activeMaxPrice);
    if (activeMaxLeadTime && key !== "maxLeadTime") params.set("maxLeadTime", activeMaxLeadTime);
    if (value !== null) params.set(key, value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-char flex items-center gap-1.5">
          <SlidersHorizontal size={14} /> Filters
        </p>
        {activeFilterCount > 0 && (
          <button
            onClick={() => router.push(pathname)}
            className="text-xs text-ember hover:underline flex items-center gap-1"
          >
            <X size={11} /> Clear all
          </button>
        )}
      </div>

      {/* Machine type */}
      {machineTypes.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-ash mb-2.5">
            Type
          </p>
          <div className="space-y-1.5">
            {machineTypes.map((t) => (
              <button
                key={t}
                onClick={() =>
                  applyFilter("type", activeType === t ? null : t)
                }
                className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                  activeType === t
                    ? "bg-ember text-white"
                    : "text-ash hover:bg-steam hover:text-char"
                }`}
              >
                {MACHINE_TYPE_LABELS[t] ?? t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div>
        <p className="text-xs uppercase tracking-wide text-ash mb-2.5">
          Max price
        </p>
        <div className="space-y-1.5">
          {[5000, 10000, 15000, 20000].map((price) => {
            const val = String(price);
            return (
              <button
                key={price}
                onClick={() =>
                  applyFilter(
                    "maxPrice",
                    activeMaxPrice === val ? null : val
                  )
                }
                className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                  activeMaxPrice === val
                    ? "bg-ember text-white"
                    : "text-ash hover:bg-steam hover:text-char"
                }`}
              >
                Up to ${price.toLocaleString()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lead time */}
      <div>
        <p className="text-xs uppercase tracking-wide text-ash mb-2.5">
          Lead time
        </p>
        <div className="space-y-1.5">
          {[14, 21, 30].map((days) => {
            const val = String(days);
            return (
              <button
                key={days}
                onClick={() =>
                  applyFilter(
                    "maxLeadTime",
                    activeMaxLeadTime === val ? null : val
                  )
                }
                className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                  activeMaxLeadTime === val
                    ? "bg-ember text-white"
                    : "text-ash hover:bg-steam hover:text-char"
                }`}
              >
                Under {days} days
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}