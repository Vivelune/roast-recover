import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import {
  sendOrderConfirmationEmail,
  sendSubscriptionConfirmationEmail,
} from "@/lib/email";
import { qualifyReferral, trackReferral } from "@/app/actions/referral";
import { markOnboardingStep } from "@/app/actions/onboarding";
import { createActivityEntry } from "@/lib/notifications";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    console.error("[webhook] ❌ No stripe-signature header");
    return new Response("No signature", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[webhook] ❌ STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("[webhook] ❌ Signature verification failed:", err.message);
    return new Response(`Signature failed: ${err.message}`, { status: 400 });
  }

  console.log(`[webhook] ✅ Event received: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    console.log("[webhook] Session metadata:", JSON.stringify(session.metadata));
    console.log("[webhook] Session mode:", session.mode);
    console.log("[webhook] Payment intent:", session.payment_intent);

    const { orderId, orderItemId, paymentType } = session.metadata ?? {};

    // ── 1. Packaging one-time ──────────────────────────────────────────
    if (paymentType === "packaging" && orderId) {
      console.log(`[webhook] Processing packaging payment for order: ${orderId}`);
      try {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
          include: { items: { include: { product: true } }, user: true },
        });
        await createActivityEntry(order.userId, {
          type: "order_placed",
          title: `Order placed — ${order.items[0]?.product.name}${
            order.items.length > 1 ? ` +${order.items.length - 1}` : ""
          }`,
          metadata: {
            orderId: order.id,
          },
        });
        const { refCode } = session.metadata ?? {};
  if (refCode) {
    try {
      await trackReferral(refCode, order.user.email);
    } catch {}
  }
        console.log(`[webhook] ✅ Packaging order ${orderId} set to PAID`);
        try {
          await markOnboardingStep("firstOrder");
        } catch {}
        // Check if this is the user's first paid order
        const paidOrderCount = await prisma.order.count({
          where: {
            userId: order.userId,
            status: "PAID",
            id: {
              not: orderId, // exclude the current order
            },
          },
        });

        if (paidOrderCount === 0) {
          console.log(
            `[webhook] 🎉 First paid order for user ${order.userId}, qualifying referral`
          );

          await qualifyReferral(order.userId);
        }

        await sendOrderConfirmationEmail({
          to: order.user.email,
          customerName: order.user.name,
          orderId: order.id,
          items: order.items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            priceCents: i.unitPriceCents,
          })),
          total: order.items.reduce(
            (sum, i) => sum + i.unitPriceCents * i.quantity,
            0
          ),
          isEquipment: false,
        });
      } catch (err) {
        console.error(
          `[webhook] ❌ Failed to update packaging order ${orderId}:`,
          err
        );
      }
    }

    // ── 2. Equipment deposit ──────────────────────────────────────────
    else if (paymentType === "deposit" && orderId) {
      console.log(`[webhook] Processing deposit for order: ${orderId}`);
      try {
        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!existingOrder) {
          console.error(`[webhook] ❌ Order not found: ${orderId}`);
        } else {
          console.log(
            `[webhook] Found order, current status: ${existingOrder.status}`
          );
          console.log(
            `[webhook] Items count: ${existingOrder.items.length}`
          );

          const itemUpdate = await prisma.orderItem.updateMany({
            where: { orderId },
            data: {
              itemStatus: "AWAITING_BALANCE",
              depositPaidAt: new Date(),
              stripeDepositPaymentIntentId: session.payment_intent ?? null,
            },
          });

          console.log(
            `[webhook] ✅ Updated ${itemUpdate.count} order items to AWAITING_BALANCE`
          );

          const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "AWAITING_BALANCE",
              depositPaidAt: new Date(),
              stripeDepositPaymentIntentId: session.payment_intent ?? null,
            },
            include: { items: { include: { product: true } }, user: true },
          });

          console.log(
            `[webhook] ✅ Order ${orderId} set to AWAITING_BALANCE`
          );

          const totalDeposit = updatedOrder.items.reduce((sum, i) => {
            const d = Math.round(
              (i.unitPriceCents * (i.depositPercent ?? 0)) / 100
            );
            return sum + d * i.quantity;
          }, 0);

          await sendOrderConfirmationEmail({
            to: updatedOrder.user.email,
            customerName: updatedOrder.user.name,
            orderId: updatedOrder.id,
            items: updatedOrder.items.map((i) => ({
              name: i.product.name,
              quantity: i.quantity,
              priceCents: i.unitPriceCents,
            })),
            total: totalDeposit,
            isEquipment: true,
          });
        }
      } catch (err) {
        console.error(
          `[webhook] ❌ Failed to process deposit for order ${orderId}:`,
          err
        );
      }
    }

    // ── 3. Equipment balance (per item) ──────────────────────────────
    else if (paymentType === "balance" && orderItemId) {
      console.log(`[webhook] Processing balance for item: ${orderItemId}`);
      try {
        const updatedItem = await prisma.orderItem.update({
          where: { id: orderItemId },
          data: {
            itemStatus: "IN_PRODUCTION",
            balancePaidAt: new Date(),
            stripeBalancePaymentIntentId: session.payment_intent ?? null,
          },
        });

        console.log(
          `[webhook] ✅ Item ${orderItemId} set to IN_PRODUCTION`
        );

        const allItems = await prisma.orderItem.findMany({
          where: { orderId: updatedItem.orderId },
        });

        console.log(
          `[webhook] All item statuses:`,
          allItems.map((i) => i.itemStatus)
        );

        const allDelivered = allItems.every(
          (i) => i.itemStatus === "DELIVERED"
        );

        const allShipped = allItems.every((i) =>
          ["SHIPPED", "DELIVERED"].includes(i.itemStatus ?? "")
        );

        const allInProduction = allItems.every((i) =>
          ["IN_PRODUCTION", "SHIPPED", "DELIVERED"].includes(
            i.itemStatus ?? ""
          )
        );

        const newOrderStatus = allDelivered
          ? "DELIVERED"
          : allShipped
          ? "SHIPPED"
          : allInProduction
          ? "IN_PRODUCTION"
          : "AWAITING_BALANCE";

        console.log(
          `[webhook] Calculated new order status: ${newOrderStatus}`
        );

        await prisma.order.update({
          where: { id: updatedItem.orderId },
          data: { status: newOrderStatus as any },
        });

        console.log(
          `[webhook] ✅ Order ${updatedItem.orderId} set to ${newOrderStatus}`
        );
      } catch (err) {
        console.error(
          `[webhook] ❌ Failed to process balance for item ${orderItemId}:`,
          err
        );
      }
    }

    // ── 4. Subscription checkout ──────────────────────────────────────
    if (session.mode === "subscription" && session.subscription) {
      const { userId, productId, intervalDays } = session.metadata ?? {};

      if (userId && productId) {
        try {
          const sub = await prisma.subscription.upsert({
            where: { stripeSubscriptionId: session.subscription as string },
            update: {},
            create: {
              userId,
              productId,
              stripeSubscriptionId: session.subscription as string,
              status: "active",
              intervalDays: parseInt(intervalDays ?? "30"),
            },
            include: { product: true, user: true },
          });
          await createActivityEntry(sub.userId, {
            type: "sub_renewed",
            title: `Auto-reorder active — ${sub.product.name}`,
            metadata: {
              productId: sub.productId,
            },
          });
          console.log(
            `[webhook] ✅ Subscription created for user ${userId}`
          );

          await sendSubscriptionConfirmationEmail({
            to: sub.user.email,
            customerName: sub.user.name,
            productName: sub.product.name,
            intervalDays: sub.intervalDays,
            priceCents: sub.product.priceCents,
          });
        } catch (err) {
          console.error(
            `[webhook] ❌ Failed to create subscription:`,
            err
          );
        }
      }
    }
  }

  // ── Subscription lifecycle events ──────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as any;

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { status: "canceled" },
    });

    console.log(`[webhook] ✅ Subscription ${sub.id} canceled`);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as any;

    if (invoice.subscription) {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription },
        data: { status: "past_due" },
      });

      console.log(
        `[webhook] ✅ Subscription ${invoice.subscription} marked past_due`
      );
    }
  }

  return new Response("ok", { status: 200 });
}