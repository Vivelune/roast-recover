
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function PackagingPage() {
  const products = await prisma.product.findMany({
    where: { category: "PACKAGING", active: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-8 py-16">
      <FadeIn>
        <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">Packaging</p>
        <h1 className="font-display font-semibold text-3xl text-char mb-3">Never run out mid-shift.</h1>
        <p className="text-ash text-[15px] mb-12 max-w-md">Cups, lids and bags, priced direct from certified factories — order once or set up auto-reorder.</p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <Link href={`/packaging/${p.slug}`} className="group block">
            <div className="relative bg-steam rounded-lg aspect-square mb-4 transition-transform group-hover:scale-[1.02]">
  <Image
    src={p.images[0] ?? "/placeholder.png"}
    alt={p.name}
    fill
    className="object-cover rounded-lg"
  />
  </div>
              <p className="text-sm font-medium text-char">{p.name}</p>
              <p className="text-sm text-ash">${(p.priceCents / 100).toFixed(2)}</p>
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}