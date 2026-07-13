import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  ShieldCheck, Clock, FileCheck2,
  Truck, Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import ImageGallery from "@/components/ImageGallery";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import { StarDisplay } from "@/components/StarRating";
import AddToEquipmentCartButton from "@/components/AddToEquipmentCartButton";
import FadeIn from "@/components/FadeIn";
import QuoteButton from "@/components/QuoteButton";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, user] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        certification: true,
        reviews: {
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!product || !product.active || product.category !== "EQUIPMENT") {
    notFound();
  }

  const depositPercent = product.depositPercent ?? 0;
  const deposit = Math.round((product.priceCents * depositPercent) / 100);
  const balance = product.priceCents - deposit;

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
            {/* Cert badge */}
            {product.certification && (
  <div className="flex items-center gap-2">
    <Badge variant="secondary" className="gap-1.5">
      <ShieldCheck size={12} />
      {product.certification.type} certified
    </Badge>

    <a
      href={product.certification.documentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-ember hover:underline"
    >
      #{product.certification.listingNumber} ↗
    </a>
  </div>
)}

            <div>
              <h1 className="font-display font-semibold text-3xl text-char mb-1">
                {product.name}
              </h1>

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

              <p className="text-sm text-ash flex items-center gap-1.5 mt-1">
                <Clock size={13} />
                {product.leadTimeDays}-day estimated lead time
              </p>
            </div>

            <Separator />

            <p className="text-ash text-[15px] leading-relaxed">
              {product.description}
            </p>

            {/* Payment breakdown */}
            <div className="bg-steam/50 border border-steam rounded-lg p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-ash">
                Payment breakdown (per unit)
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-char">
                  Deposit today ({depositPercent}%)
                </span>
                <span className="font-semibold text-char">
                  ${(deposit / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-steam pt-2">
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
            <QuoteButton productId={product.id} />
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

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Specifications</TabsTrigger>
          <TabsTrigger value="process">How it ships</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews{" "}
            {product.reviews.length > 0 && `(${product.reviews.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs uppercase tracking-wide text-ash mb-3">
                  About this machine
                </p>
                <p className="text-[15px] text-ash leading-relaxed">
                  {product.description}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ash mb-3">
                  Certifications &amp; compliance
                </p>
                <ul className="space-y-2 text-sm">
                  {product.certification ? (
                    <>
                      <li className="flex items-center gap-2 text-ash">
                        <ShieldCheck size={14} className="text-ember" />
                        {product.certification.type} certified — #
                        {product.certification.listingNumber}
                      </li>
                      <li className="flex items-center gap-2 text-ash">
                        <Package size={14} className="text-ember" />
                        Commercial kitchen approved
                      </li>
                    </>
                  ) : (
                    <li className="text-ash text-sm">
                      Certification details coming soon.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="process">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileCheck2 size={18} />,
                title: "Deposit secures your order",
                body: "Your deposit confirms the order with our manufacturing partner and locks in current pricing.",
              },
              {
                icon: <ShieldCheck size={18} />,
                title: "Certification reconfirmed",
                body: "Before shipping, we verify the unit's certification documentation is current and valid.",
              },
              {
                icon: <Truck size={18} />,
                title: "Balance due, then it ships",
                body: "We email a secure payment link for the remaining balance once your machine is ready.",
              },
            ].map((s) => (
              <Card key={s.title} className="p-5">
                <div className="w-9 h-9 rounded-full bg-steam flex items-center justify-center text-ember mb-3">
                  {s.icon}
                </div>
                <p className="font-medium text-char text-sm mb-1.5">
                  {s.title}
                </p>
                <p className="text-ash text-sm leading-relaxed">{s.body}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="grid md:grid-cols-[1fr_320px] gap-10">
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
            <Card className="p-5 self-start">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}