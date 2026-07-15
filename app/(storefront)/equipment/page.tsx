import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
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

  // Get ranges for filter UI
  const allProducts = await prisma.product.findMany({
    where: { category: "EQUIPMENT", active: true },
    select: { machineType: true, priceCents: true, leadTimeDays: true },
  });

  const machineTypes = [
    ...new Set(
      allProducts.map((p) => p.machineType).filter(Boolean) as string[]
    ),
  ];
  const maxProductPrice = Math.max(...allProducts.map((p) => p.priceCents));
  const maxProductLead = Math.max(
    ...allProducts.map((p) => p.leadTimeDays ?? 0)
  );

  const activeFilterCount = [type, maxPrice, maxLeadTime].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-8 py-16">
      <FadeIn>
        <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">
          Equipment
        </p>
        <h1 className="font-display font-semibold text-3xl text-char mb-3">
          Certified machines, sourced direct.
        </h1>
        <p className="text-ash text-[15px] mb-8 max-w-md">
          A deposit secures your order — the rest is due once it's sourced and
          ready to ship.
        </p>
      </FadeIn>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full md:w-52 flex-shrink-0">
          <EquipmentFilters
            machineTypes={machineTypes}
            maxProductPrice={maxProductPrice}
            maxProductLead={maxProductLead}
            activeType={type}
            activeMaxPrice={maxPrice}
            activeMaxLeadTime={maxLeadTime}
            activeFilterCount={activeFilterCount}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-char font-medium mb-2">
                No products match those filters
              </p>
              <Link
                href="/equipment"
                className="text-ember text-sm font-medium"
              >
                Clear filters →
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs text-ash mb-5">
                {products.length} product{products.length !== 1 ? "s" : ""}
                {activeFilterCount > 0 && (
                  <Link
                    href="/equipment"
                    className="ml-2 text-ember hover:underline"
                  >
                    Clear filters
                  </Link>
                )}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((p, i) => {
                  const deposit = Math.round(
                    (p.priceCents * (p.depositPercent ?? 0)) / 100
                  );
                  return (
                    <FadeIn key={p.id} delay={i * 0.05}>
                      <Link
                        href={`/equipment/${p.slug}`}
                        className="group block border border-border rounded-xl p-4 hover:border-ember/30 transition-colors"
                      >
                        <div className="relative bg-steam rounded-lg aspect-square mb-3 overflow-hidden">
                          <Image
                            src={p.images?.[0] ?? "/placeholder.png"}
                            alt={p.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                        {p.certification && (
                          <span className="inline-flex items-center gap-1 text-xs bg-steam text-ash px-2.5 py-1 rounded-md mb-2">
                            <ShieldCheck size={12} /> {p.certification.type}
                          </span>
                        )}
                        <p className="text-sm font-medium text-char mb-0.5">
                          {p.name}
                        </p>
                        <p className="text-sm text-char">
                          ${(p.priceCents / 100).toFixed(0)}
                        </p>
                        <p className="text-xs text-ash">
                          ${(deposit / 100).toFixed(0)} deposit ·{" "}
                          {p.leadTimeDays}-day lead
                        </p>
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