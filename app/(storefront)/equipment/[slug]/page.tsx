import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Clock, FileCheck2, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import FadeIn from "@/components/FadeIn";
import AddToEquipmentCartButton from "@/components/AddToEquipmentCartButton";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { certification: true },
  });

  if (!product || !product.active || product.category !== "EQUIPMENT") {
    notFound();
  }

  const depositPercent = product.depositPercent ?? 0;
  const deposit = Math.round((product.priceCents * depositPercent) / 100);
  const balance = product.priceCents - deposit;

  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <div className="grid md:grid-cols-2 gap-14 mb-16">
        <FadeIn>
          <div className="relative bg-steam rounded-2xl aspect-square overflow-hidden">
            <Image
              src={product.images?.[0] ?? "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-4">
            {product.certification && (
              <Badge variant="secondary" className="w-fit gap-1.5">
                <ShieldCheck size={12} />
                {product.certification.type} certified — #{product.certification.listingNumber}
              </Badge>
            )}

            <div>
              <h1 className="font-display font-semibold text-3xl text-char mb-1">
                {product.name}
              </h1>
              <p className="text-2xl font-medium text-char">
                ${(product.priceCents / 100).toFixed(2)}
              </p>
            </div>

            <p className="text-sm text-ash flex items-center gap-1.5">
              <Clock size={13} />
              {product.leadTimeDays}-day estimated lead time
            </p>

            <Separator />

            <p className="text-ash text-[15px] leading-relaxed">
              {product.description}
            </p>

            {/* Payment breakdown */}
            <div className="border border-border rounded-lg p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-ash">
                Payment breakdown (per unit)
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-char">
                  Deposit today ({depositPercent}%)
                </span>
                <span className="font-medium text-char">
                  ${(deposit / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-ash">Balance due on completion</span>
                <span className="text-ash">${(balance / 100).toFixed(2)}</span>
              </div>
            </div>

            <AddToEquipmentCartButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                depositPercent,
                leadTimeDays: product.leadTimeDays,
                image: product.images?.[0],
              }}
            />

            <p className="text-xs text-ash text-center">
              Review your full equipment order in the{" "}
              <Link href="/equipment/cart" className="text-ember underline">
                equipment cart
              </Link>{" "}
              before paying the deposit.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* What happens next */}
      <div className="border-t border-border pt-12">
        <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-6">
          What happens after you order
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <FileCheck2 size={18} />, title: "Deposit secures your order", copy: "Your deposit confirms each machine with our manufacturing partner and locks in pricing." },
            { icon: <ShieldCheck size={18} />, title: "Certification reconfirmed", copy: "We verify each unit's certification documentation before it leaves the factory." },
            { icon: <Truck size={18} />, title: "Balance, then it ships", copy: "We email a payment link for each machine's remaining balance once it's ready — machines can ship independently." },
          ].map((s) => (
            <div key={s.title}>
              <div className="w-9 h-9 rounded-full bg-steam flex items-center justify-center text-ember mb-3">
                {s.icon}
              </div>
              <p className="font-medium text-char text-sm mb-1.5">{s.title}</p>
              <p className="text-ash text-sm leading-relaxed">{s.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}