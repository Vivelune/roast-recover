"use client";
import { useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

const MATERIAL_LABELS: Record<string, string> = {
  paper: "Paper",
  compostable: "Compostable",
  plastic: "Plastic",
  PLA: "PLA (Bioplastic)",
};

export default function PackagingFilters({
  sizes,
  materials,
  activeSize,
  activeMaterial,
  activeMaxPrice,
  activeFilterCount,
}: {
  sizes: string[];
  materials: string[];
  activeSize?: string;
  activeMaterial?: string;
  activeMaxPrice?: string;
  activeFilterCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function applyFilter(key: string, value: string | null) {
    const params = new URLSearchParams();
    if (activeSize && key !== "size") params.set("size", activeSize);
    if (activeMaterial && key !== "material") params.set("material", activeMaterial);
    if (activeMaxPrice && key !== "maxPrice") params.set("maxPrice", activeMaxPrice);
    if (value !== null) params.set(key, value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-char flex items-center gap-2">
          <SlidersHorizontal size={13} className="text-[#B5481F]" /> Filters
        </p>
        {activeFilterCount > 0 && (
          <button
            onClick={() => router.push(pathname)}
            className="text-[10px] font-bold uppercase tracking-wider text-ash hover:text-[#B5481F] transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Filter Sections */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ash">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => applyFilter("size", activeSize === s ? null : s)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  activeSize === s
                    ? "bg-[#B5481F] text-white border-[#B5481F]"
                    : "border-gray-200 text-char hover:border-[#B5481F]/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {materials.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ash">Material</p>
          <div className="space-y-1">
            {materials.map((m) => (
              <button
                key={m}
                onClick={() => applyFilter("material", activeMaterial === m ? null : m)}
                className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                  activeMaterial === m
                    ? "text-[#B5481F] bg-[#B5481F]/5"
                    : "text-ash hover:text-char hover:bg-steam"
                }`}
              >
                {MATERIAL_LABELS[m] ?? m}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ash">Max Price</p>
        <div className="space-y-1">
          {[50, 100, 200, 500].map((price) => {
            const val = String(price);
            return (
              <button
                key={price}
                onClick={() => applyFilter("maxPrice", activeMaxPrice === val ? null : val)}
                className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                  activeMaxPrice === val
                    ? "text-[#B5481F] bg-[#B5481F]/5"
                    : "text-ash hover:text-char hover:bg-steam"
                }`}
              >
                Up to ${price}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}