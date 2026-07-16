import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  ShieldCheck, Clock, FileCheck2,
  Truck, Package, ArrowLeft, MessageSquarePlus
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
import ProductJsonLd from "@/components/ProductJsonLd";



export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { certification: true },
  });

  if (!product) return { title: "Product not found" };

  const deposit = product.depositPercent
    ? Math.round((product.priceCents * product.depositPercent) / 100)
    : null;

  return {
    title: `${product.name} — Commercial Espresso Equipment`,
    description:
      product.shortDesc ??
      `Buy ${product.name} direct from certified factory. ${
        product.certification
          ? `${product.certification.type} certified. `
          : ""
      }${deposit ? `$${(deposit / 100).toFixed(0)} deposit, balance on completion. ` : ""}${
        product.leadTimeDays ? `${product.leadTimeDays}-day lead time.` : ""
      }`.trim(),
    openGraph: {
      title: product.name,
      description: product.shortDesc ?? product.description,
      images: product.images?.[0]
        ? [{ url: product.images[0], alt: product.name }]
        : [],
    },
  };
}


// We use a small client-side wrapper in ReviewForm or keep state local if needed.
// To make this fully functional and spacious, we present a beautiful, stacked layout.
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


<ProductJsonLd
  name={product.name}
  description={product.description}
  image={product.images?.[0]}
  priceCents={product.priceCents}
  availability="PreOrder"
  sku={product.id}
/>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      {/* Back to Catalog */}
      <Link
        href="/equipment"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ash hover:text-char transition-colors"
      >
        <ArrowLeft size={13} /> Back to equipment
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
        {/* Left Column: Image gallery */}
        <FadeIn>
          <ImageGallery images={product.images} alt={product.name} />
        </FadeIn>

        {/* Right Column: Product details panel */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Cert & Compliance badge wrapper */}
            {product.certification && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1.5 bg-[#FBFBFA] border border-gray-150 text-char hover:bg-steam px-2.5 py-1 text-xs rounded-lg">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  {product.certification.type} Certified
                </Badge>

                <a
                  href={product.certification.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-ember hover:text-ember-dark hover:underline flex items-center gap-0.5"
                >
                  #{product.certification.listingNumber} ↗
                </a>
              </div>
            )}

            <div>
              <h1 className="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl text-char tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                {product.reviews.length > 0 && (
                  <StarDisplay
                    rating={avgRating}
                    size={14}
                    showNumber
                    count={product.reviews.length}
                  />
                )}
                <span className="text-xs text-ash flex items-center gap-1">
                  <Clock size={12} />
                  {product.leadTimeDays}-day estimated lead
                </span>
              </div>

              <p className="text-2xl sm:text-3xl font-bold text-char mt-4">
                ${(product.priceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <Separator className="border-gray-100" />

            <p className="text-ash text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>

            {/* Structured payment breakdown card */}
            <div className="bg-[#FBFBFA] border border-gray-150 rounded-xl p-4.5 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ash">
                Payment Schedule (Per Unit)
              </p>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-char font-medium">
                  Deposit Due Today <span className="text-xs text-ash">({depositPercent}%)</span>
                </span>
                <span className="font-bold text-char">
                  ${(deposit / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm border-t border-gray-200/60 pt-2.5">
                <span className="text-ash font-medium">Balance Due on Sourcing Completion</span>
                <span className="text-char font-semibold">
                  ${(balance / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Action Group */}
            <div className="flex flex-col gap-3">
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
            </div>

            <p className="text-[11px] text-ash text-center leading-normal">
              Review your full order in the{" "}
              <Link href="/equipment/cart" className="text-ember font-bold hover:underline">
                equipment cart
              </Link>{" "}
              before committing to deposit payments.
            </p>
          </div>
        </FadeIn>
      </div>

    {/* Replaced the compressed horizontal tabs with a spacious, 
        vertically stacked outline. Everything has room to breathe.
      */}
      <div className="space-y-16 pt-8 border-t border-gray-150">
        
        {/* Section 1: Specifications */}
        <section className="space-y-6">
          <div className="border-b border-gray-150 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-char">
              Specifications
            </h2>
          </div>
          <Card className="p-6 sm:p-8 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ash tracking-widest">
                  Product Overview
                </p>
                <p className="text-sm text-char leading-relaxed">
                  {product.description}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ash tracking-widest">
                  Compliance &amp; Certifications
                </p>
                <ul className="space-y-4 text-sm">
                  {product.certification ? (
                    <>
                      <li className="flex items-start gap-3 text-char font-medium">
                        <ShieldCheck size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="leading-tight">{product.certification.type} Certified</p>
                          <p className="text-xs text-ash mt-1 font-normal">
                            Listing registration #{product.certification.listingNumber}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 text-char font-medium">
                        <Package size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">Commercial food service sanitation approved</span>
                      </li>
                    </>
                  ) : (
                    <li className="text-ash text-xs italic">
                      Compliance and manufacturing documentation coming soon.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 2: How It Ships */}
        <section className="space-y-6">
          <div className="border-b border-gray-150 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-char">
              How It Ships
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FileCheck2 size={16} />,
                title: "1. Deposit Secures Sourcing",
                body: "Your initial deposit locks in the price, initiates manufacturing allocations, and confirms your priority placement.",
              },
              {
                icon: <ShieldCheck size={16} />,
                title: "2. Rigorous Standards Check",
                body: "Our technical operations staff verify all certification parameters and inspect physical specs before import transit.",
              },
              {
                icon: <Truck size={16} />,
                title: "3. Complete Balance & Ships",
                body: "Once local logistics staging is ready, we issue your balance invoice. Upon settlement, the unit ships to your café.",
              },
            ].map((s) => (
              <Card key={s.title} className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-steam/60 border border-gray-200/30 flex items-center justify-center text-char mb-4">
                    {s.icon}
                  </div>
                  <p className="font-semibold text-char text-sm mb-2">
                    {s.title}
                  </p>
                  <p className="text-ash text-xs sm:text-sm leading-relaxed">{s.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 3: Reviews */}
        <section className="space-y-6">
          <div className="border-b border-gray-150 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-char">
              Reviews {product.reviews.length > 0 && `(${product.reviews.length})`}
            </h2>
          </div>

          <div className="space-y-8">
            {/* Header Row: Average Rating Summary & Inline Form Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-gray-100">
              {product.reviews.length > 0 ? (
                <div className="flex items-center gap-4">
                  <p className="font-display font-semibold text-5xl text-char tracking-tight">
                    {avgRating.toFixed(1)}
                  </p>
                  <div>
                    <StarDisplay rating={avgRating} size={18} />
                    <p className="text-xs text-ash mt-1 font-medium">
                      Based on {product.reviews.length} custom review{product.reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-char text-base">No reviews yet</p>
                  <p className="text-xs text-ash mt-0.5">Be the first to share your experience with this equipment.</p>
                </div>
              )}

              {/* Collapsible Form trigger container */}
              <div className="flex-shrink-0">
                {user ? (
                  <details className="group">
                    <summary className="inline-flex items-center justify-center gap-2 bg-char hover:bg-char/90 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer select-none transition-all list-none [&::-webkit-details-marker]:hidden">
                      <MessageSquarePlus size={14} className="group-open:rotate-45 transition-transform" />
                      <span>{existingReview ? "Edit Your Review" : "Write a Review"}</span>
                    </summary>
                    
                    {/* The form opens downward directly in context, fully unconstrained */}
                    <div className="mt-6 w-full max-w-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                      <Card className="p-6 border-gray-150 shadow-md bg-white rounded-2xl">
                        <p className="text-xs font-bold uppercase tracking-wider text-char mb-4 tracking-widest">
                          {existingReview ? "Modify Your Review" : "Share Experience"}
                        </p>
                        <ReviewForm
                          productId={product.id}
                          slug={product.slug}
                          category={product.category}
                          existingReview={existingReview}
                        />
                      </Card>
                    </div>
                  </details>
                ) : (
                  <p className="text-xs text-ash leading-relaxed max-w-xs">
                    Please{" "}
                    <a href="/sign-in" className="text-ember font-bold hover:underline">
                      Sign In
                    </a>{" "}
                    to leave product feedback. Only certified owners are eligible.
                  </p>
                )}
              </div>
            </div>

            {/* Clean, spacious vertical review list */}
            <div className="max-w-3xl">
              <ReviewList reviews={product.reviews} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}