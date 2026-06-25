"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

type CartItemInput = {
  productId: string;
  quantity: number;
};

export async function createCheckoutSession(
  cartItems: CartItemInput[],
  addressId: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not signed in");
  }

  // Find synced Prisma user
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }


  const products = await prisma.product.findMany({
    where: {
      id: {
        in: cartItems.map((i) => i.productId),
      },
    },
  });


  const order = await prisma.order.create({
    data: {
      userId: user.id,
      addressId,
      status: "PAID",

      items: {
        create: cartItems.map((item) => {
          const product = products.find(
            (p) => p.id === item.productId
          );

          if (!product) {
            throw new Error("Product missing");
          }

          return {
            productId: product.id,
            quantity: item.quantity,
            unitPriceCents: product.priceCents,
          };
        }),
      },
    },
  });


  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    line_items: cartItems.map((item) => {
      const product = products.find(
        (p) => p.id === item.productId
      );

      if (!product) {
        throw new Error("Product missing");
      }


      return {
        price_data: {
          currency: "usd",

          product_data: {
            name: product.name,
          },

          unit_amount: product.priceCents,
        },

        quantity: item.quantity,
      };
    }),


    metadata: {
      orderId: order.id,
      userId: user.id,
    },


    success_url:
      `${process.env.NEXT_PUBLIC_URL}/account/orders/${order.id}?success=true`,

    cancel_url:
      `${process.env.NEXT_PUBLIC_URL}/checkout`,
  });


  return {
    checkoutUrl: session.url,
  };
}