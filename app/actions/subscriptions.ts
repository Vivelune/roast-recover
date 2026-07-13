"use server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSubscriptionCheckout(
  productId: string,
  intervalDays: number
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product || !product.isSubscribable) {
    throw new Error("Product is not subscribable");
  }
  if (!product.stripePriceId) {
    throw new Error(
      "No Stripe recurring price configured for this product — add stripePriceId in admin"
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: product.stripePriceId, quantity: 1 }],
    metadata: {
      userId: user.id,
      productId: product.id,
      intervalDays: String(intervalDays),
      userEmail: user.email,
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/account/subscriptions?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/packaging/${product.slug}`,
  });

  if (!session.url) throw new Error("Stripe session creation failed");
  return { checkoutUrl: session.url };
}

export async function cancelSubscription(subscriptionId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const sub = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId: user.id },
  });
  if (!sub) throw new Error("Subscription not found");

  // Cancel at period end in Stripe — customer keeps access until billing period ends
  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "canceled" },
  });

  revalidatePath("/account/subscriptions");
}