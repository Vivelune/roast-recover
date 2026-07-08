import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { orderId, orderItemId, paymentType } = session.metadata ?? {};

    if (paymentType === "packaging" && orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
    } else if (paymentType === "deposit" && orderId) {
      await prisma.orderItem.updateMany({
        where: { orderId },
        data: {
          itemStatus: "AWAITING_BALANCE",
          depositPaidAt: new Date(),
          stripeDepositPaymentIntentId: session.payment_intent,
        },
      });
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "AWAITING_BALANCE",
          depositPaidAt: new Date(),
          stripeDepositPaymentIntentId: session.payment_intent,
        },
      });
    } else if (paymentType === "balance" && orderItemId) {
      await prisma.orderItem.update({
        where: { id: orderItemId },
        data: {
          itemStatus: "IN_PRODUCTION",
          balancePaidAt: new Date(),
          stripeBalancePaymentIntentId: session.payment_intent,
        },
      });
    }
  }

  return new Response("ok", { status: 200 });
}