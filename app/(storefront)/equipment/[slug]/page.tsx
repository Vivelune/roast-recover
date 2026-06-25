import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ShieldCheck, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import Image from "next/image";

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

  if (
    !product ||
    !product.active ||
    product.category !== "EQUIPMENT"
  ) {
    notFound();
  }

  const user = await getCurrentUser();

  const address = user?.addresses?.[0];

  const deposit = Math.round(
    (product.priceCents * (product.depositPercent ?? 0)) / 100
  );

  return (
    <div className="max-w-5xl mx-auto px-8 py-16 grid md:grid-cols-2 gap-14">

<div className="relative bg-steam rounded-2xl aspect-square overflow-hidden">
        <Image
          src={product.images?.[0] ?? "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div>

        {product.certification && (
          <span className="
            inline-flex items-center gap-1.5
            text-xs bg-steam text-ash
            px-3 py-1.5 rounded-md mb-4
          ">
            <ShieldCheck size={13} />
            {product.certification.type} certified —
            #{product.certification.listingNumber}
          </span>
        )}

        <h1 className="font-display font-semibold text-3xl text-char mb-2">
          {product.name}
        </h1>

        <p className="text-xl text-char mb-1">
          ${(product.priceCents / 100).toFixed(2)}
        </p>

        <p className="text-sm text-ash mb-6 flex items-center gap-1.5">
          <Clock size={13}/>
          ${(deposit / 100).toFixed(2)} deposit today · 
          {product.leadTimeDays}-day lead time
        </p>

        <p className="text-ash mb-8">
          {product.description}
        </p>


        {user && address ? (
          <button className="
            bg-ember text-white
            px-6 py-3 rounded-lg
          ">
            Start Order
          </button>
        ) : (
          <p className="text-sm text-ash">
            <a
              href="/sign-in"
              className="text-ember font-medium"
            >
              Sign in
            </a>{" "}
            to order — you'll add a shipping address at checkout.
          </p>
        )}

      </div>
    </div>
  );
}