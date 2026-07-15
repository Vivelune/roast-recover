"use server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";

export async function createReorderSession(
  productId: string,
  quantity: number,
  addressId: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) throw new Error("Product not found");

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      addressId,
      status: "PENDING",
      items: {
        create: [{
          productId: product.id,
          quantity,
          unitPriceCents: product.priceCents,
        }],
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name: `${product.name} (reorder)` },
        unit_amount: product.priceCents,
      },
      quantity,
    }],
    metadata: { orderId: order.id, paymentType: "packaging" },
    success_url: `${process.env.NEXT_PUBLIC_URL}/account/orders/${order.id}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/account`,
  });

  if (!session.url) throw new Error("Could not start reorder");
  return { checkoutUrl: session.url };
}