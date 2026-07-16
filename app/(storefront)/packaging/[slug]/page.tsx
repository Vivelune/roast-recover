import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RefreshCw, Tag, ShoppingBag, ArrowLeft, MessageSquarePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import SubscribeButton from "@/components/SubscribeButton";
import ImageGallery from "@/components/ImageGallery";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import { StarDisplay } from "@/components/StarRating";
import { getCurrentUser } from "@/lib/auth";
import FadeIn from "@/components/FadeIn";
import StockBadge from "@/components/StockBadge";

export default async function PackagingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, user] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        reviews: {
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!product || !product.active || product.category !== "PACKAGING") notFound();

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  const existingReview = user
    ? product.reviews.find((r) => r.user.email === user.email) ?? null
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Back Navigation */}
      <Link href="/packaging" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ash hover:text-char transition-colors">
        <ArrowLeft size={13} /> Back to packaging
      </Link>

      {/* Main Hero Grid */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        <FadeIn>
          <div className="bg-steam rounded-2xl overflow-hidden border border-gray-100">
            <ImageGallery images={product.images} alt={product.name} />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-6">
            <div>
              <Badge variant="secondary" className="mb-3 px-3 py-1 text-[10px] uppercase tracking-wider">Packaging</Badge>
              <h1 className="font-display font-semibold text-3xl sm:text-4xl text-char tracking-tight">{product.name}</h1>
              
              {product.reviews.length > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  <StarDisplay rating={avgRating} size={15} showNumber count={product.reviews.length} />
                </div>
              )}

              <p className="text-3xl font-bold text-char mt-4">${(product.priceCents / 100).toFixed(2)}</p>
              <div className="mt-2">
                <StockBadge stockQty={product.stockQty} threshold={product.lowStockThreshold} />
              </div>
            </div>

            <Separator className="border-gray-100" />

            <p className="text-ash text-sm sm:text-base leading-relaxed">{product.description}</p>

            <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider text-ash">
              <span className="flex items-center gap-1.5 bg-steam/60 px-3 py-1.5 rounded-lg">
                <Tag size={13} className="text-[#B5481F]" /> FDA Compliant
              </span>
              <span className="flex items-center gap-1.5 bg-steam/60 px-3 py-1.5 rounded-lg">
                <ShoppingBag size={13} className="text-[#B5481F]" /> Factory Direct
              </span>
            </div>

            {product.isSubscribable && (
              <div className="flex items-start gap-4 bg-steam/50 border border-steam rounded-xl px-5 py-4">
                <RefreshCw size={20} className="text-[#B5481F] flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-ash leading-relaxed">
                  <strong>Enable Auto-Reorder</strong> to maintain supply. Ships every 30 days. Cancel anytime.
                </p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <AddToCartButton product={{ productId: product.id, slug: product.slug, name: product.name, priceCents: product.priceCents, image: product.images?.[0] }} />
              {product.isSubscribable && product.stripePriceId && <SubscribeButton productId={product.id} intervalDays={30} />}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Stacked Vertical Sections */}
      <div className="space-y-16 border-t border-gray-150 pt-16">
        
        {/* Specifications */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-char border-b border-gray-150 pb-3">Product details</h2>
          <Card className="p-8 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ash">Overview</p>
                <p className="text-sm text-ash leading-relaxed">{product.description}</p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ash">Compliance</p>
                <ul className="space-y-3 text-sm text-char font-medium">
                  <li className="flex items-center gap-2">• FDA food-contact compliant</li>
                  <li className="flex items-center gap-2">• Sourced from certified factory</li>
                  {product.isSubscribable && <li className="flex items-center gap-2">• Auto-reorder eligible</li>}
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Reviews */}
        <section className="space-y-8">
          <div className="border-b border-gray-150 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-char">Reviews ({product.reviews.length})</h2>
          </div>

          <div className="grid md:grid-cols-[1fr_320px] gap-12">
            <div>
              {product.reviews.length > 0 ? (
                <div className="flex items-center gap-6 mb-10">
                  <p className="font-display font-semibold text-5xl text-char tracking-tight">{avgRating.toFixed(1)}</p>
                  <div>
                    <StarDisplay rating={avgRating} size={18} />
                    <p className="text-xs font-bold text-ash mt-1.5 uppercase tracking-wider">Based on {product.reviews.length} reviews</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-char mb-10">No reviews yet.</p>
              )}
              <ReviewList reviews={product.reviews} />
            </div>

            <Card className="p-6 border-gray-150 shadow-md bg-white rounded-2xl h-fit">
              <p className="text-sm font-bold text-char mb-5">{existingReview ? "Edit your review" : "Share your experience"}</p>
              {user ? (
                <ReviewForm productId={product.id} slug={product.slug} category={product.category} existingReview={existingReview} />
              ) : (
                <p className="text-sm text-ash">Please <Link href="/sign-in" className="text-[#B5481F] font-bold hover:underline">sign in</Link> to review.</p>
              )}
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}