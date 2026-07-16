import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import {
  sendOrderConfirmationEmail,
  sendSubscriptionConfirmationEmail,
} from "@/lib/email";
import { trackReferral, qualifyReferral } from "@/app/actions/referral";
import { notifyAndLog } from "@/lib/notifications";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    console.error("[webhook] ❌ No stripe-signature header");
    return new Response("No signature", { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[webhook] ❌ Signature verification failed:", err.message);
    return new Response(`Signature failed: ${err.message}`, { status: 400 });
  }

  console.log(`[webhook] ✅ Event received: ${event.type}`);

  // ── CHECKOUT COMPLETED ─────────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { orderId, orderItemId, paymentType, refCode } = session.metadata ?? {};

    // 1. Packaging one-time
    if (paymentType === "packaging" && orderId) {
      console.log(`[webhook] Processing packaging payment for order: ${orderId}`);
      try {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
          include: { items: { include: { product: true } }, user: true },
        });

        const firstProductName = order.items[0]?.product.name ?? "your order";
        const totalCents = order.items.reduce(
          (sum, i) => sum + i.unitPriceCents * i.quantity,
          0
        );

        // Notification + activity
        await notifyAndLog(
          order.userId,
          {
            type: "order_placed",
            title: "Order confirmed",
            body: `${firstProductName}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ""} — $${(totalCents / 100).toFixed(2)} paid.`,
            href: `/account/orders/${order.id}`,
          },
          {
            type: "order_placed",
            title: `Order placed — ${firstProductName}${order.items.length > 1 ? ` +${order.items.length - 1}` : ""}`,
            metadata: { orderId: order.id, totalCents },
          }
        );

        // Confirmation email
        await sendOrderConfirmationEmail({
          to: order.user.email,
          customerName: order.user.name,
          orderId: order.id,
          items: order.items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            priceCents: i.unitPriceCents,
          })),
          total: totalCents,
          isEquipment: false,
        });

        // Referral tracking
        if (refCode) {
          try { await trackReferral(refCode, order.user.email); } catch {}
        }

        // Qualify referral on first order
        const paidCount = await prisma.order.count({
          where: { userId: order.userId, status: "PAID", id: { not: orderId } },
        });
        if (paidCount === 0) {
          try { await qualifyReferral(order.userId); } catch {}
        }

        // Onboarding: mark first order step
        try {
          await prisma.onboardingProgress.upsert({
            where: { userId: order.userId },
            update: { firstOrder: true },
            create: { userId: order.userId, firstOrder: true },
          });
        } catch {}

        console.log(`[webhook] ✅ Packaging order ${orderId} processed`);
      } catch (err) {
        console.error(`[webhook] ❌ Packaging order failed:`, err);
      }
    }

    // 2. Equipment deposit
    else if (paymentType === "deposit" && orderId) {
      console.log(`[webhook] Processing deposit for order: ${orderId}`);
      try {
        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: { include: { product: true } }, user: true },
        });

        if (!existingOrder) {
          console.error(`[webhook] ❌ Order not found: ${orderId}`);
        } else {
          await prisma.orderItem.updateMany({
            where: { orderId },
            data: {
              itemStatus: "AWAITING_BALANCE",
              depositPaidAt: new Date(),
              stripeDepositPaymentIntentId: session.payment_intent,
            },
          });

          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "AWAITING_BALANCE",
              depositPaidAt: new Date(),
              stripeDepositPaymentIntentId: session.payment_intent,
            },
            include: { items: { include: { product: true } }, user: true },
          });

          const totalDeposit = order.items.reduce((sum, i) => {
            const d = Math.round((i.unitPriceCents * (i.depositPercent ?? 0)) / 100);
            return sum + d * i.quantity;
          }, 0);

          const firstProductName = order.items[0]?.product.name ?? "your machine";

          // Notification + activity
          await notifyAndLog(
            order.userId,
            {
              type: "deposit_confirmed",
              title: "Deposit received — equipment order confirmed",
              body: `$${(totalDeposit / 100).toFixed(2)} deposit confirmed for ${firstProductName}. We'll email you when it's ready for the balance payment.`,
              href: `/account/orders/${order.id}`,
            },
            {
              type: "deposit_paid",
              title: `Deposit paid — ${firstProductName} order secured`,
              metadata: { orderId: order.id, depositCents: totalDeposit },
            }
          );

          // Confirmation email
          await sendOrderConfirmationEmail({
            to: order.user.email,
            customerName: order.user.name,
            orderId: order.id,
            items: order.items.map((i) => ({
              name: i.product.name,
              quantity: i.quantity,
              priceCents: i.unitPriceCents,
            })),
            total: totalDeposit,
            isEquipment: true,
          });

          console.log(`[webhook] ✅ Deposit processed for ${orderId}`);
        }
      } catch (err) {
        console.error(`[webhook] ❌ Deposit processing failed:`, err);
      }
    }

    // 3. Equipment balance (per item)
    else if (paymentType === "balance" && orderItemId) {
      console.log(`[webhook] Processing balance for item: ${orderItemId}`);
      try {
        const updatedItem = await prisma.orderItem.update({
          where: { id: orderItemId },
          data: {
            itemStatus: "IN_PRODUCTION",
            balancePaidAt: new Date(),
            stripeBalancePaymentIntentId: session.payment_intent,
          },
          include: { product: true, order: { include: { user: true } } },
        });

        const allItems = await prisma.orderItem.findMany({
          where: { orderId: updatedItem.orderId },
        });

        const allInProduction = allItems.every((i) =>
          ["IN_PRODUCTION", "SHIPPED", "DELIVERED"].includes(i.itemStatus ?? "")
        );
        const allDelivered = allItems.every((i) => i.itemStatus === "DELIVERED");
        const allShipped = allItems.every((i) =>
          ["SHIPPED", "DELIVERED"].includes(i.itemStatus ?? "")
        );

        const newOrderStatus = allDelivered
          ? "DELIVERED"
          : allShipped
          ? "SHIPPED"
          : allInProduction
          ? "IN_PRODUCTION"
          : "AWAITING_BALANCE";

        await prisma.order.update({
          where: { id: updatedItem.orderId },
          data: { status: newOrderStatus as any },
        });

        const balancePaid =
          updatedItem.product
            ? updatedItem.unitPriceCents * updatedItem.quantity -
              Math.round((updatedItem.unitPriceCents * (updatedItem.depositPercent ?? 0)) / 100) *
                updatedItem.quantity
            : 0;

        // Notification + activity
        await notifyAndLog(
          updatedItem.order.userId,
          {
            type: "balance_confirmed",
            title: "Balance payment received",
            body: `$${(balancePaid / 100).toFixed(2)} balance confirmed for ${updatedItem.product.name}. It's now in production.`,
            href: `/account/orders/${updatedItem.orderId}`,
          },
          {
            type: "balance_paid",
            title: `${updatedItem.product.name} entered production`,
            metadata: {
              orderId: updatedItem.orderId,
              balanceCents: balancePaid,
            },
          }
        );

        console.log(`[webhook] ✅ Balance processed for item ${orderItemId}`);
      } catch (err) {
        console.error(`[webhook] ❌ Balance processing failed:`, err);
      }
    }

    // 4. Subscription checkout
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

          await notifyAndLog(
            userId,
            {
              type: "subscription_active",
              title: "Auto-reorder activated",
              body: `${sub.product.name} will auto-reorder every ${sub.intervalDays} days.`,
              href: "/account/subscriptions",
            },
            {
              type: "sub_renewed",
              title: `Auto-reorder active — ${sub.product.name}`,
              metadata: { productId },
            }
          );

          await sendSubscriptionConfirmationEmail({
            to: sub.user.email,
            customerName: sub.user.name,
            productName: sub.product.name,
            intervalDays: sub.intervalDays,
            priceCents: sub.product.priceCents,
          });

          console.log(`[webhook] ✅ Subscription created for user ${userId}`);
        } catch (err) {
          console.error(`[webhook] ❌ Subscription creation failed:`, err);
        }
      }
    }
  }

  // ── SUBSCRIPTION LIFECYCLE ──────────────────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as any;
    const record = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: sub.id },
      include: { product: true },
    });

    if (record) {
      await prisma.subscription.update({
        where: { id: record.id },
        data: { status: "canceled" },
      });

      await notifyAndLog(
        record.userId,
        {
          type: "subscription_canceled",
          title: "Auto-reorder canceled",
          body: `${record.product.name} auto-reorder has been canceled.`,
          href: "/account/subscriptions",
        }
      );
    }

    console.log(`[webhook] ✅ Subscription canceled`);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as any;
    if (invoice.subscription) {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription },
        data: { status: "past_due" },
      });
    }
  }

  return new Response("ok", { status: 200 });
}