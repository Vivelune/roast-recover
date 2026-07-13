"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { sendBalancePaymentEmail } from "@/lib/email";

type CartItemInput = {
  productId: string;
  quantity: number;
};

// Helper to safely clean up a failed order
async function cleanupFailedOrder(orderId: string) {
  try {
    await prisma.orderItem.deleteMany({
      where: { orderId },
    });

    await prisma.order.delete({
      where: { id: orderId },
    });
  } catch (error) {
    console.error("Failed to clean up order:", error);
  }
}

export async function createEquipmentOrderCheckout(
  cartItems: CartItemInput[],
  addressId: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  if (!cartItems.length) throw new Error("No equipment in order");

  const products = await prisma.product.findMany({
    where: {
      id: { in: cartItems.map((i) => i.productId) },
      category: "EQUIPMENT",
      active: true,
    },
  });

  if (products.length !== cartItems.length) {
    throw new Error("One or more equipment items are unavailable");
  }

  for (const p of products) {
    if (!p.depositPercent) {
      throw new Error(
        `${p.name} has no deposit configured — contact support`
      );
    }
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      addressId,
      status: "PENDING_DEPOSIT",
      items: {
        create: cartItems.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;

          return {
            productId: product.id,
            quantity: item.quantity,
            unitPriceCents: product.priceCents,
            depositPercent: product.depositPercent,
            itemStatus: "PENDING_DEPOSIT",
            estimatedShipDate: product.leadTimeDays
              ? new Date(
                  Date.now() + product.leadTimeDays * 24 * 60 * 60 * 1000
                )
              : undefined,
          };
        }),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const lineItems = order.items.map((item) => {
    const deposit = Math.round(
      (item.unitPriceCents * (item.depositPercent ?? 0)) / 100
    );

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.product.name} — deposit (${item.depositPercent}%)`,
        },
        unit_amount: deposit,
      },
      quantity: item.quantity,
    };
  });

  let session;

  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        paymentType: "deposit",
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/account/orders/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/equipment/checkout`,
    });
  } catch (stripeError) {
    await cleanupFailedOrder(order.id);

    console.error("Stripe checkout creation failed:", stripeError);

    throw new Error(
      "Could not start checkout — please try again or contact support."
    );
  }

  if (!session.url) {
    await cleanupFailedOrder(order.id);

    throw new Error(
      "Stripe did not return a checkout URL. Please try again."
    );
  }

  return {
    checkoutUrl: session.url,
  };
}

// Called from admin per item when that machine is ready to ship
export async function createBalanceCheckoutForItem(orderItemId: string) {
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      product: true,
      order: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!item) throw new Error("Order item not found");

  const depositPerUnit = Math.round(
    (item.unitPriceCents * (item.depositPercent ?? 0)) / 100
  );

  const balancePerUnit = item.unitPriceCents - depositPerUnit;
  const totalBalance = balancePerUnit * item.quantity;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: item.order.user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${item.product.name} — remaining balance`,
          },
          unit_amount: totalBalance,
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderItemId: item.id,
      paymentType: "balance",
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/account/orders/${item.orderId}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/account/orders/${item.orderId}`,
  });

  if (!session.url) {
    throw new Error("Stripe session creation failed");
  }

  await sendBalancePaymentEmail({
    to: item.order.user.email,
    customerName: item.order.user.name,
    productName: item.product.name,
    balanceAmount: totalBalance,
    checkoutUrl: session.url,
    orderId: item.orderId,
  });

  return {
    checkoutUrl: session.url,
  };
}