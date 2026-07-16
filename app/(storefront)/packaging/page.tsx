import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import PackagingFilters from "@/components/PackagingFilters";
import { markOnboardingStep } from "@/app/actions/onboarding";
import StockBadge from "@/components/StockBadge";

export const metadata = {
  title: "Café Packaging — Cups, Lids & Bags",
  description:
    "FDA-compliant cups, lids, and coffee bags for cafés. Order in any quantity, subscribe for auto-reorder. Direct factory pricing.",
};



export default async function PackagingPage({
  searchParams,
}: {
  searchParams: Promise<{
    size?: string;
    material?: string;
    maxPrice?: string;
  }>;
}) {
  const { size, material, maxPrice } = await searchParams;

  const where: any = { category: "PACKAGING", active: true };
  if (size) where.packageSize = size;
  if (material) where.material = material;
  if (maxPrice) where.priceCents = { lte: parseInt(maxPrice) * 100 };

  const [products, allProducts] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: "asc" } }),
    prisma.product.findMany({ where: { category: "PACKAGING", active: true }, select: { packageSize: true, material: true, priceCents: true } })
  ]);

  try { await markOnboardingStep("firstPackagingBrowse"); } catch {}

  const sizes = [...new Set(allProducts.map((p) => p.packageSize).filter(Boolean) as string[])].sort();
  const materials = [...new Set(allProducts.map((p) => p.material).filter(Boolean) as string[])];
  const activeFilterCount = [size, material, maxPrice].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
      <FadeIn>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5481F] mb-3">
          Packaging
        </p>
        <h1 className="font-display font-semibold text-4xl text-char tracking-tight mb-3">
          Reliable supply, direct access.
        </h1>
        <p className="text-ash text-base max-w-md">
          Professional-grade cups, lids, and bags. Order on-demand or automate your restock cycle.
        </p>
      </FadeIn>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-56 flex-shrink-0">
          <PackagingFilters
            sizes={sizes}
            materials={materials}
            activeSize={size}
            activeMaterial={material}
            activeMaxPrice={maxPrice}
            activeFilterCount={activeFilterCount}
          />
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-2xl">
              <p className="text-char font-semibold">No matches found</p>
              <Link href="/packaging" className="text-[#B5481F] text-sm font-bold mt-2 block">Clear filters &rarr;</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.05}>
                  <Link href={`/packaging/${p.slug}`} className="group block">
                    <div className="relative bg-steam rounded-2xl aspect-square mb-4 overflow-hidden border border-gray-100">
                      <Image
                        src={p.images?.[0] ?? "/placeholder.png"}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {p.packageSize && <span className="text-[10px] font-bold uppercase tracking-wider bg-steam text-ash px-2 py-1 rounded-md">{p.packageSize}</span>}
                        {p.material && <span className="text-[10px] font-bold uppercase tracking-wider bg-steam text-ash px-2 py-1 rounded-md">{p.material}</span>}
                      </div>
                      <p className="text-sm font-bold text-char group-hover:text-[#B5481F] transition-colors">{p.name}</p>
                      <StockBadge stockQty={p.stockQty} threshold={p.lowStockThreshold} />
                      <p className="text-sm font-semibold text-char">${(p.priceCents / 100).toFixed(2)}</p>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}