import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = "Roast & Recover <ritual@roastandrecover.com>";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get all customers with at least 2 packaging orders
  const users = await prisma.user.findMany({
    where: {
      orders: {
        some: {
          status: "PAID",
          items: { some: { product: { category: "PACKAGING" } } },
        },
      },
    },
    include: {
      subscriptions: { where: { status: "active" } },
      orders: {
        where: {
          status: "PAID",
          items: { some: { product: { category: "PACKAGING" } } },
        },
        include: {
          items: {
            where: { product: { category: "PACKAGING" } },
            include: { product: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  let emailsSent = 0;

  for (const user of users) {
    // Group orders by product
    const productOrders: Record<string, typeof user.orders> = {};
    for (const order of user.orders) {
      for (const item of order.items) {
        if (!productOrders[item.productId]) {
          productOrders[item.productId] = [];
        }
        productOrders[item.productId].push(order);
      }
    }

    for (const [productId, orders] of Object.entries(productOrders)) {
      if (orders.length < 2) continue;

      // Skip if already has active subscription for this product
      const hasSub = user.subscriptions.some((s) => s.productId === productId);
      if (hasSub) continue;

      // Calculate average interval
      const intervals: number[] = [];
      for (let i = 1; i < orders.length; i++) {
        const diff =
          (orders[i].createdAt.getTime() - orders[i - 1].createdAt.getTime()) /
          (1000 * 60 * 60 * 24);
        intervals.push(diff);
      }
      const avgInterval = Math.round(
        intervals.reduce((a, b) => a + b, 0) / intervals.length
      );

      const lastOrder = orders[orders.length - 1];
      const daysSinceLast = Math.floor(
        (Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Send reminder when they're 80% through their typical interval
      // but haven't reordered yet
      const triggerDay = Math.round(avgInterval * 0.8);
      if (daysSinceLast !== triggerDay) continue;

      const lastItem = lastOrder.items.find((i) => i.productId === productId);
      if (!lastItem) continue;

      const productName = lastItem.product.name;
      const reorderUrl = `${process.env.NEXT_PUBLIC_URL}/packaging/${lastItem.product.slug}`;

      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: `Running low on ${productName}? Reorder now →`,
        html: `
          <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0E0B08;">
            <p style="font-size:18px;font-weight:600;margin:0 0 8px;">
              roast<span style="color:#B5481F;">&</span>recover
            </p>
            <hr style="border:none;border-top:1px solid #e5e1db;margin:16px 0 24px;"/>
            <p style="font-size:15px;margin:0 0 12px;">
              Hi${user.name ? ` ${user.name.split(" ")[0]}` : ""},
            </p>
            <p style="font-size:15px;color:#7A6A58;margin:0 0 20px;">
              Based on your order history, you typically reorder 
              <strong style="color:#0E0B08;">${productName}</strong> 
              every ~${avgInterval} days. You're coming up on that now.
            </p>
            <a href="${reorderUrl}"
              style="display:inline-block;background:#B5481F;color:#fff;
                     text-decoration:none;padding:12px 24px;border-radius:6px;
                     font-size:14px;font-weight:500;margin-bottom:20px;">
              Reorder ${productName} →
            </a>
            <p style="font-size:13px;color:#7A6A58;">
              Want to set this up automatically?
              <a href="${process.env.NEXT_PUBLIC_URL}/account/subscriptions" style="color:#B5481F;">
                Set up auto-reorder
              </a> and never run out.
            </p>
            <hr style="border:none;border-top:1px solid #e5e1db;margin:20px 0;"/>
            <p style="font-size:12px;color:#7A6A58;">
              You're receiving this because you've ordered from Roast & Recover before.
            </p>
          </div>
        `,
      });

      emailsSent++;
    }
  }

  console.log(`[cron] Sent ${emailsSent} reorder reminder emails`);
  return NextResponse.json({ emailsSent });
}