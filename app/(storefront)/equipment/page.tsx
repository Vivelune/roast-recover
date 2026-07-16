import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import EquipmentFilters from "@/components/EquipmentFilters";

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    maxPrice?: string;
    maxLeadTime?: string;
  }>;
}) {
  const { type, maxPrice, maxLeadTime } = await searchParams;

  const where: any = { category: "EQUIPMENT", active: true };
  if (type) where.machineType = type;
  if (maxPrice) where.priceCents = { lte: parseInt(maxPrice) * 100 };
  if (maxLeadTime) where.leadTimeDays = { lte: parseInt(maxLeadTime) };

  const products = await prisma.product.findMany({
    where,
    include: { certification: true },
    orderBy: { createdAt: "asc" },
  });

  const allProducts = await prisma.product.findMany({
    where: { category: "EQUIPMENT", active: true },
    select: { machineType: true, priceCents: true, leadTimeDays: true },
  });

  const machineTypes = [
    ...new Set(
      allProducts.map((p) => p.machineType).filter(Boolean) as string[]
    ),
  ];
  const maxProductPrice = Math.max(...allProducts.map((p) => p.priceCents), 0);
  const maxProductLead = Math.max(
    ...allProducts.map((p) => p.leadTimeDays ?? 0), 0
  );

  const activeFilterCount = [type, maxPrice, maxLeadTime].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header section */}
      <FadeIn>
        <div className="mb-10 sm:mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-ember font-bold mb-2.5">
            Equipment Catalog
          </p>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl text-char tracking-tight mb-3">
            Certified machines, sourced direct.
          </h1>
          <p className="text-ash text-sm sm:text-base max-w-md leading-relaxed">
            A deposit secures your order — the balance is due only when your equipment is sourced and ready to ship.
          </p>
        </div>
      </FadeIn>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar and Mobile Trigger wrapper */}
        <EquipmentFilters
          machineTypes={machineTypes}
          maxProductPrice={maxProductPrice}
          maxProductLead={maxProductLead}
          activeType={type}
          activeMaxPrice={maxPrice}
          activeMaxLeadTime={maxLeadTime}
          activeFilterCount={activeFilterCount}
        />

        {/* Product grid container */}
        <div className="flex-1 w-full">
          {products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl bg-steam/5">
              <p className="text-char font-semibold text-lg mb-1.5">
                No products match those filters
              </p>
              <p className="text-ash text-sm mb-5">Try relaxing your price constraints or filter selections.</p>
              <Link
                href="/equipment"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-char hover:bg-char/90 rounded-lg transition-colors"
              >
                Reset All Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <p className="text-xs font-semibold text-ash uppercase tracking-wider">
                  Showing {products.length} machine{products.length !== 1 ? "s" : ""}
                </p>
                {activeFilterCount > 0 && (
                  <Link
                    href="/equipment"
                    className="text-xs font-bold text-ember hover:text-ember-dark transition-colors"
                  >
                    Clear All Filters ({activeFilterCount})
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p, i) => {
                  const deposit = Math.round(
                    (p.priceCents * (p.depositPercent ?? 0)) / 100
                  );
                  return (
                    <FadeIn key={p.id} delay={i * 0.05}>
                      <Link
                        href={`/equipment/${p.slug}`}
                        className="group flex flex-col h-full border border-gray-150 rounded-2xl p-3 bg-white hover:border-ember/40 hover:shadow-lg hover:shadow-char/[0.02] transition-all duration-300"
                      >
                        {/* Image wrapper */}
                        <div className="relative bg-steam rounded-xl aspect-square mb-4 overflow-hidden">
                          <Image
                            src={p.images?.[0] ?? "/placeholder.png"}
                            alt={p.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          {p.certification && (
                            <div className="absolute top-2.5 left-2.5 z-10">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/95 text-char backdrop-blur border border-gray-100 px-2.5 py-1 rounded-md shadow-sm">
                                <ShieldCheck size={11} className="text-emerald-600" /> {p.certification.type}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Text and Pricing details */}
                        <div className="flex flex-col flex-1 px-1 pb-1">
                          <h3 className="text-sm font-semibold text-char mb-1 group-hover:text-ember transition-colors leading-snug">
                            {p.name}
                          </h3>
                          
                          <div className="mt-auto pt-2 space-y-1">
                            <p className="text-base font-bold text-char">
                              ${(p.priceCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-[11px] text-ash font-medium">
                              <span className="text-char font-semibold">${(deposit / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> deposit · <span className="text-char font-semibold">{p.leadTimeDays}d</span> lead time
                            </p>
                          </div>
                        </div>
                      </Link>
                    </FadeIn>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}