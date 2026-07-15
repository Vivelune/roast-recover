import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import PackagingFilters from "@/components/PackagingFilters";
import { markOnboardingStep } from "@/app/actions/onboarding";
import StockBadge from "@/components/StockBadge";

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

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  const allProducts = await prisma.product.findMany({
    where: { category: "PACKAGING", active: true },
    select: { packageSize: true, material: true, priceCents: true },
  });

  try {
    await markOnboardingStep("firstPackagingBrowse");
  } catch {}

  const sizes = [
    ...new Set(
      allProducts.map((p) => p.packageSize).filter(Boolean) as string[]
    ),
  ].sort();
  const materials = [
    ...new Set(
      allProducts.map((p) => p.material).filter(Boolean) as string[]
    ),
  ];

  const activeFilterCount = [size, material, maxPrice].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-8 py-16">
      <FadeIn>
        <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">
          Packaging
        </p>
        <h1 className="font-display font-semibold text-3xl text-char mb-3">
          Never run out mid-shift.
        </h1>
        <p className="text-ash text-[15px] mb-8 max-w-md">
          Cups, lids and bags, priced direct — order once or set up
          auto-reorder.
        </p>
      </FadeIn>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-52 flex-shrink-0">
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
            <div className="text-center py-16">
              <p className="text-char font-medium mb-2">
                No products match those filters
              </p>
              <Link
                href="/packaging"
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
                    href="/packaging"
                    className="ml-2 text-ember hover:underline"
                  >
                    Clear filters
                  </Link>
                )}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {products.map((p, i) => (
                  <FadeIn key={p.id} delay={i * 0.05}>
                    <Link
                      href={`/packaging/${p.slug}`}
                      className="group block"
                    >
                      <div className="relative bg-steam rounded-xl aspect-square mb-3 overflow-hidden">
                        <Image
                          src={p.images?.[0] ?? "/placeholder.png"}
                          alt={p.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-[1.02]"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {p.packageSize && (
                          <span className="text-[10px] bg-steam text-ash px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {p.packageSize}
                          </span>
                        )}
                        {p.material && (
                          <span className="text-[10px] bg-steam text-ash px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {p.material}
                          </span>
                        )}
                        {p.caseQty && (
                          <span className="text-[10px] bg-steam text-ash px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {p.caseQty.toLocaleString()} / case
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-char">
                        {p.name}
                      </p>
                      <StockBadge
  stockQty={p.stockQty}
  threshold={p.lowStockThreshold}
/>
                      <p className="text-sm text-char">
                        ${(p.priceCents / 100).toFixed(2)}
                      </p>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}