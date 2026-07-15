import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { ShieldCheck } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const products = query
    ? await prisma.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { shortDesc: { contains: query, mode: "insensitive" } },
            { tags: { has: query.toLowerCase() } },
            { machineType: { contains: query, mode: "insensitive" } },
            { material: { contains: query, mode: "insensitive" } },
            { packageSize: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { certification: true },
        orderBy: [{ category: "asc" }, { createdAt: "desc" }],
      })
    : [];

  const equipment = products.filter((p) => p.category === "EQUIPMENT");
  const packaging = products.filter((p) => p.category === "PACKAGING");

  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      {/* Search bar */}
      <FadeIn>
        <form method="GET" action="/search" className="mb-10">
          <div className="relative max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ash"
            />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search equipment, packaging, materials..."
              autoFocus
              className="w-full border border-border rounded-lg pl-11 pr-4 py-3 text-sm text-char bg-white focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember"
            />
          </div>
        </form>
      </FadeIn>

      {/* No query state */}
      {!query && (
        <div className="text-center py-20">
          <Search size={32} className="text-ash mx-auto mb-4" />
          <p className="font-medium text-char mb-1">Search products</p>
          <p className="text-ash text-sm">
            Try "espresso machine", "12oz cups", "NSF", "compostable"
          </p>
        </div>
      )}

      {/* No results */}
      {query && products.length === 0 && (
        <div className="text-center py-20">
          <p className="font-medium text-char mb-1">
            No results for "{query}"
          </p>
          <p className="text-ash text-sm mb-4">
            Try a broader search or browse by category.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/equipment"
              className="text-sm text-ember font-medium border border-ember/30 px-4 py-2 rounded-md hover:bg-steam/40 transition-colors"
            >
              Browse equipment
            </Link>
            <Link
              href="/packaging"
              className="text-sm text-ember font-medium border border-ember/30 px-4 py-2 rounded-md hover:bg-steam/40 transition-colors"
            >
              Browse packaging
            </Link>
          </div>
        </div>
      )}

      {/* Results */}
      {query && products.length > 0 && (
        <div className="space-y-10">
          <p className="text-sm text-ash">
            {products.length} result{products.length !== 1 ? "s" : ""} for "
            <span className="text-char font-medium">{query}</span>"
          </p>

          {equipment.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-wide text-ash mb-4">
                Equipment ({equipment.length})
              </p>
              <div className="grid md:grid-cols-3 gap-5">
                {equipment.map((p, i) => (
                  <FadeIn key={p.id} delay={i * 0.04}>
                    <SearchProductCard product={p} />
                  </FadeIn>
                ))}
              </div>
            </section>
          )}

          {packaging.length > 0 && (
            <section>
              <p className="text-xs uppercase tracking-wide text-ash mb-4">
                Packaging ({packaging.length})
              </p>
              <div className="grid md:grid-cols-3 gap-5">
                {packaging.map((p, i) => (
                  <FadeIn key={p.id} delay={i * 0.04}>
                    <SearchProductCard product={p} />
                  </FadeIn>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function SearchProductCard({ product }: { product: any }) {
  const href =
    product.category === "EQUIPMENT"
      ? `/equipment/${product.slug}`
      : `/packaging/${product.slug}`;

  return (
    <Link href={href} className="group block border border-border rounded-xl p-4 hover:border-ember/30 transition-colors">
      <div className="relative bg-steam rounded-lg aspect-[4/3] mb-3 overflow-hidden">
        <Image
          src={product.images?.[0] ?? "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      {product.certification && (
        <span className="inline-flex items-center gap-1 text-xs bg-steam text-ash px-2 py-0.5 rounded-md mb-1.5">
          <ShieldCheck size={11} /> {product.certification.type}
        </span>
      )}
      <p className="text-sm font-medium text-char leading-snug mb-1">
        {product.name}
      </p>
      {product.shortDesc && (
        <p className="text-xs text-ash leading-relaxed mb-1.5 line-clamp-2">
          {product.shortDesc}
        </p>
      )}
      <p className="text-sm text-char">
        ${(product.priceCents / 100).toFixed(0)}
      </p>
    </Link>
  );
}