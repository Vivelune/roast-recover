import { prisma } from "@/lib/prisma";

export type ReorderInsight = {
  productId: string;
  productName: string;
  productSlug: string;
  priceCents: number;
  image?: string;
  avgIntervalDays: number;
  lastOrderDate: Date;
  daysSinceLastOrder: number;
  estimatedRunoutDate: Date;
  isLow: boolean;      // within 7 days of estimated runout
  lastQuantity: number;
  lastOrderId: string;
};

export async function getReorderInsights(userId: string): Promise<ReorderInsight[]> {
  // Get all packaging orders grouped by product
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ["PAID", "DELIVERED"] },
    },
    include: {
      items: {
        where: { product: { category: "PACKAGING" } },
        include: { product: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Group order items by productId with timestamps
  const productOrders: Record<
    string,
    { date: Date; quantity: number; orderId: string; product: any }[]
  > = {};

  for (const order of orders) {
    for (const item of order.items) {
      if (!productOrders[item.productId]) {
        productOrders[item.productId] = [];
      }
      productOrders[item.productId].push({
        date: order.createdAt,
        quantity: item.quantity,
        orderId: order.id,
        product: item.product,
      });
    }
  }

  const insights: ReorderInsight[] = [];
  const now = new Date();

  for (const [productId, productOrderList] of Object.entries(productOrders)) {
    // Need at least 2 orders to calculate cadence
    if (productOrderList.length < 2) continue;

    // Calculate average interval between orders
    const intervals: number[] = [];
    for (let i = 1; i < productOrderList.length; i++) {
      const diff =
        (productOrderList[i].date.getTime() -
          productOrderList[i - 1].date.getTime()) /
        (1000 * 60 * 60 * 24);
      // Only count intervals > 1 day — same-day test orders skew the average
      if (diff > 1) intervals.push(diff);
    }
    
    // If we don't have meaningful intervals, skip this product
    if (intervals.length === 0) continue;
    
    const avgInterval = Math.round(
      intervals.reduce((a, b) => a + b, 0) / intervals.length
    );
    
    // Safety guard — never show reorder widget for intervals under 3 days
    if (avgInterval < 3) continue;

    
    const lastOrder = productOrderList[productOrderList.length - 1];
    const daysSinceLast = Math.floor(
      (now.getTime() - lastOrder.date.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysUntilRunout = avgInterval - daysSinceLast;
    const estimatedRunoutDate = new Date(
      lastOrder.date.getTime() + avgInterval * 24 * 60 * 60 * 1000
    );

    insights.push({
      productId,
      productName: lastOrder.product.name,
      productSlug: lastOrder.product.slug,
      priceCents: lastOrder.product.priceCents,
      image: lastOrder.product.images?.[0],
      avgIntervalDays: avgInterval,
      lastOrderDate: lastOrder.date,
      daysSinceLastOrder: daysSinceLast,
      estimatedRunoutDate,
      isLow: daysUntilRunout <= 7,
      lastQuantity: lastOrder.quantity,
      lastOrderId: lastOrder.orderId,
    });
  }

  return insights.sort((a, b) => a.estimatedRunoutDate.getTime() - b.estimatedRunoutDate.getTime());
}