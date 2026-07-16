"use client";
import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  function applyFilter(key: string, value: string | null) {
    const params = new URLSearchParams();
    if (activeType && key !== "type") params.set("type", activeType);
    if (activeMaxPrice && key !== "maxPrice") params.set("maxPrice", activeMaxPrice);
    if (activeMaxLeadTime && key !== "maxLeadTime") params.set("maxLeadTime", activeMaxLeadTime);
    if (value !== null) params.set(key, value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const filterContent = (
    <div className="space-y-6">
      {/* Machine type */}
      {machineTypes.length > 0 && (
        <div className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ash mb-3">
            Machine Type
          </p>
          <div className="space-y-1">
            {machineTypes.map((t) => (
              <button
                key={t}
                onClick={() =>
                  applyFilter("type", activeType === t ? null : t)
                }
                className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                  activeType === t
                    ? "bg-char text-white shadow-sm"
                    : "text-ash hover:bg-steam/40 hover:text-char"
                }`}
              >
                {MACHINE_TYPE_LABELS[t] ?? t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      <div className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ash mb-3">
          Price Limit
        </p>
        <div className="space-y-1">
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
                className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                  activeMaxPrice === val
                    ? "bg-char text-white shadow-sm"
                    : "text-ash hover:bg-steam/40 hover:text-char"
                }`}
              >
                Up to ${price.toLocaleString()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lead time */}
      <div className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ash mb-3">
          Maximum Lead Time
        </p>
        <div className="space-y-1">
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
                className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                  activeMaxLeadTime === val
                    ? "bg-char text-white shadow-sm"
                    : "text-ash hover:bg-steam/40 hover:text-char"
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

  return (
    <>
      {/* Mobile Toggle Trigger Button */}
      <div className="w-full lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-char text-sm hover:border-char/25 transition-colors shadow-sm"
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center bg-ember text-white rounded-full w-4 h-4 text-[9px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Sidebar Layout */}
      <aside className="hidden lg:block w-48 flex-shrink-0 bg-white border border-gray-150 p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3.5 mb-4">
          <p className="text-xs font-bold text-char uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal size={12} /> Filters
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={() => router.push(pathname)}
              className="text-[10px] font-bold text-ember hover:text-ember-dark flex items-center gap-0.5"
            >
              <X size={10} /> Clear
            </button>
          )}
        </div>
        {filterContent}
      </aside>

      {/* Mobile Sidebar Off-canvas Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop blur */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-char/40 backdrop-blur-sm"
          />
          {/* Content panel */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <p className="text-sm font-bold text-char uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal size={14} /> Filter Options
                </p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 hover:bg-steam rounded-md transition-colors"
                >
                  <X size={18} className="text-ash" />
                </button>
              </div>

              {filterContent}
            </div>

            {/* Bottom action drawer button */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  router.push(pathname);
                  setMobileOpen(false);
                }}
                className="w-full mt-4 py-3 border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}