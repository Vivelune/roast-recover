
import { notFound } from "next/navigation";
// import AddToCartButton from "@/components/AddToCartButton";
import { RefreshCw } from "lucide-react";
import prisma from "@/lib/prisma";
import Image from "next/image";

export default async function PackagingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.active) notFound();

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
        <h1 className="font-display font-semibold text-3xl text-char mb-2">{product.name}</h1>
        <p className="text-xl text-char mb-5">${(product.priceCents / 100).toFixed(2)}</p>
        <p className="text-ash text-[15px] leading-relaxed mb-8">{product.description}</p>

        {product.isSubscribable && (
          <div className="flex items-center gap-2 text-sm text-graphite bg-gray-50 border border-gray-100 rounded-md px-4 py-3 mb-6">
            <RefreshCw size={14} />
            Set up auto-reorder so you never run low — available after checkout.
          </div>
        )}

        <button>AddToCartButton</button>
{/* 
        <AddToCartButton
          product={{ productId: product.id, slug: product.slug, name: product.name, priceCents: product.priceCents }}
        /> */}
      </div>
    </div>
  );
}