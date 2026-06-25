import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { ShieldCheck } from "lucide-react";
import prisma from "@/lib/prisma";
import Image from "next/image";

export default async function EquipmentPage() {
  const products = await prisma.product.findMany({
    where: { category: "EQUIPMENT", active: true },
    include: { certification: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-8 py-16">
      <FadeIn>
        <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">Equipment</p>
        <h1 className="font-display font-semibold text-3xl text-char mb-3">Certified machines, sourced direct.</h1>
        <p className="text-ash text-[15px] mb-12 max-w-md">A small deposit secures your order — the rest is due once it's sourced and ready to ship.</p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p, i) => {
          const deposit = Math.round((p.priceCents * (p.depositPercent ?? 0)) / 100);
          return (
            <FadeIn key={p.id} delay={i * 0.05}>
              <Link href={`/equipment/${p.slug}`} className="group block border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
              <div className="relative bg-steam rounded-lg aspect-square mb-4 transition-transform group-hover:scale-[1.02]">
  <Image
    src={p.images[0] ?? "/placeholder.png"}
    alt={p.name}
    fill
    className="object-cover rounded-lg"
  />

</div>
                {p.certification && (
                  <span className="inline-flex items-center gap-1 text-xs bg-steam text-ash px-2.5 py-1 rounded-md mb-2">
                    <ShieldCheck size={12} /> {p.certification.type} certified
                  </span>
                )}
                <p className="text-sm font-medium text-char">{p.name}</p>
                <p className="text-sm text-char">${(p.priceCents / 100).toFixed(2)}</p>
                <p className="text-xs text-ash">${(deposit / 100).toFixed(2)} deposit · {p.leadTimeDays}-day lead time</p>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}