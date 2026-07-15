"use client";
import { useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

const MATERIAL_LABELS: Record<string, string> = {
  paper: "Paper",
  compostable: "Compostable",
  plastic: "Plastic",
  PLA: "PLA (bioplastic)",
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

      {/* Size */}
      {sizes.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-ash mb-2.5">Size</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() =>
                  applyFilter("size", activeSize === s ? null : s)
                }
                className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                  activeSize === s
                    ? "bg-ember text-white border-ember"
                    : "border-border text-ash hover:border-ember/40 hover:text-char"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Material */}
      {materials.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-ash mb-2.5">
            Material
          </p>
          <div className="space-y-1.5">
            {materials.map((m) => (
              <button
                key={m}
                onClick={() =>
                  applyFilter("material", activeMaterial === m ? null : m)
                }
                className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                  activeMaterial === m
                    ? "bg-ember text-white"
                    : "text-ash hover:bg-steam hover:text-char"
                }`}
              >
                {MATERIAL_LABELS[m] ?? m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div>
        <p className="text-xs uppercase tracking-wide text-ash mb-2.5">
          Max price
        </p>
        <div className="space-y-1.5">
          {[50, 100, 200, 500].map((price) => {
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
                Up to ${price}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}