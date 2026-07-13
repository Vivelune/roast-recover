import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RefreshCw, Tag, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import AddToCartButton from "@/components/AddToCartButton";
import SubscribeButton from "@/components/SubscribeButton";
import ImageGallery from "@/components/ImageGallery";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import { StarDisplay } from "@/components/StarRating";
import { getCurrentUser } from "@/lib/auth";
import FadeIn from "@/components/FadeIn";

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

  if (!product || !product.active) notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;

  const existingReview = user
    ? product.reviews.find((r) => r.user.email === user.email) ?? null
    : null;

  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <div className="grid md:grid-cols-2 gap-14 mb-16">
        {/* Image gallery */}
        <FadeIn>
          <ImageGallery images={product.images} alt={product.name} />
        </FadeIn>

        {/* Product info */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-4">
            <div>
              <Badge variant="secondary" className="mb-3">
                Packaging
              </Badge>
              <h1 className="font-display font-semibold text-3xl text-char mb-1">
                {product.name}
              </h1>

              {/* Rating summary */}
              {product.reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <StarDisplay
                    rating={avgRating}
                    size={15}
                    showNumber
                    count={product.reviews.length}
                  />
                </div>
              )}

              <p className="text-2xl font-semibold text-char mt-3">
                ${(product.priceCents / 100).toFixed(2)}
              </p>
            </div>

            <Separator />

            <p className="text-ash text-[15px] leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-2 text-xs text-ash">
              <span className="flex items-center gap-1 bg-steam/60 px-2.5 py-1.5 rounded-full">
                <Tag size={12} /> FDA food-contact compliant
              </span>
              <span className="flex items-center gap-1 bg-steam/60 px-2.5 py-1.5 rounded-full">
                <ShoppingBag size={12} /> Direct from certified factory
              </span>
            </div>

            {product.isSubscribable && (
              <div className="flex items-start gap-2.5 bg-steam/60 border border-steam rounded-lg px-4 py-3">
                <RefreshCw
                  size={14}
                  className="text-ember mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-ash leading-relaxed">
                  Set up auto-reorder — charged and shipped automatically
                  every 30 days. Cancel anytime.
                </p>
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <AddToCartButton
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                  image: product.images?.[0],
                }}
              />
              {product.isSubscribable && product.stripePriceId && (
                <SubscribeButton
                  productId={product.id}
                  intervalDays={30}
                />
              )}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Tabs: Details + Reviews */}
      <Tabs defaultValue="reviews">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Product details</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews {product.reviews.length > 0 && `(${product.reviews.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs uppercase tracking-wide text-ash mb-3">
                  Product info
                </p>
                <p className="text-[15px] text-ash leading-relaxed">
                  {product.description}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ash mb-3">
                  Compliance
                </p>
                <ul className="space-y-2 text-sm text-ash">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-ember" />
                    FDA food-contact material compliant
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-ember" />
                    Sourced from certified factory
                  </li>
                  {product.isSubscribable && (
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ember" />
                      Auto-reorder available
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="grid md:grid-cols-[1fr_320px] gap-10">
            {/* Review list */}
            <div>
              {product.reviews.length > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <p className="font-display font-semibold text-4xl text-char">
                    {avgRating.toFixed(1)}
                  </p>
                  <div>
                    <StarDisplay rating={avgRating} size={18} />
                    <p className="text-xs text-ash mt-1">
                      {product.reviews.length} review
                      {product.reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              )}
              <ReviewList reviews={product.reviews} />
            </div>

            {/* Review form */}
            <div>
              <Card className="p-5">
                <p className="text-sm font-medium text-char mb-4">
                  {existingReview ? "Edit your review" : "Leave a review"}
                </p>
                {user ? (
                  <ReviewForm
                    productId={product.id}
                    slug={product.slug}
                    category={product.category}
                    existingReview={existingReview}
                  />
                ) : (
                  <p className="text-sm text-ash">
                    <a href="/sign-in" className="text-ember font-medium">
                      Sign in
                    </a>{" "}
                    to leave a review.
                  </p>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}