"use server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";

type CartItemInput = { productId: string; quantity: number };

export async function createCheckoutSession(
  cartItems: CartItemInput[],
  addressId: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  if (!cartItems.length) throw new Error("Cart is empty");

  const products = await prisma.product.findMany({
    where: { id: { in: cartItems.map((i) => i.productId) }, active: true },
  });

  if (products.length !== cartItems.length) {
    throw new Error("One or more products are unavailable");
  }

  // Create order first — status starts as PAID optimistically
  // Webhook confirms and can correct if payment fails
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      addressId,
      status: "PAID",
      items: {
        create: cartItems.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPriceCents: product.priceCents,
          };
        }),
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: cartItems.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: product.priceCents,
        },
        quantity: item.quantity,
      };
    }),
    metadata: { orderId: order.id, paymentType: "packaging" },
    success_url: `${process.env.NEXT_PUBLIC_URL}/account/orders/${order.id}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,
  });

  if (!session.url) throw new Error("Stripe session creation failed");

  return { checkoutUrl: session.url };
}