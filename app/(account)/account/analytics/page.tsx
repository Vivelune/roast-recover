import AccountAnalytics from "@/components/AccountAnalytics";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";


export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const now = new Date();
  const twelveMonthsAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
      status: { notIn: ["PENDING", "CANCELLED"] },
      createdAt: { gte: twelveMonthsAgo },
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "asc" },
  });

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id, status: "active" },
    include: { product: true },
  });

  // Build monthly spend data
  const months: Record<string, { packaging: number; equipment: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    months[key] = { packaging: 0, equipment: 0 };
  }

  for (const order of orders) {
    const key = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    if (!months[key]) continue;
  
    for (const item of order.items) {
      let amount: number;
  
      if (item.product.category === "EQUIPMENT" && item.depositPercent) {
        // Equipment: only count what was actually collected
        const depositPaid = item.depositPaidAt
          ? Math.round((item.unitPriceCents * item.depositPercent) / 100) *
            item.quantity
          : 0;
        const balancePaid = item.balancePaidAt
          ? item.unitPriceCents * item.quantity -
            Math.round((item.unitPriceCents * item.depositPercent) / 100) *
              item.quantity
          : 0;
        amount = depositPaid + balancePaid;
      } else {
        // Packaging: full price
        amount = item.unitPriceCents * item.quantity;
      }
  
      if (item.product.category === "PACKAGING") {
        months[key].packaging += amount;
      } else {
        months[key].equipment += amount;
      }
    }
  }

  const chartData = Object.entries(months).map(([month, data]) => ({
    month,
    packaging: data.packaging / 100,
    equipment: data.equipment / 100,
    total: (data.packaging + data.equipment) / 100,
  }));

  // Category breakdown totals
  const packagingTotal = orders.reduce((sum, o) =>
    sum + o.items
      .filter((i) => i.product.category === "PACKAGING")
      .reduce((s, i) => s + i.unitPriceCents * i.quantity, 0),
    0
  );
  
  const equipmentTotal = orders.reduce((sum, o) =>
    sum + o.items
      .filter((i) => i.product.category === "EQUIPMENT")
      .reduce((s, i) => {
        if (i.depositPercent) {
          const deposit = Math.round(
            (i.unitPriceCents * i.depositPercent) / 100
          ) * i.quantity;
          const balance = i.balancePaidAt
            ? i.unitPriceCents * i.quantity - deposit
            : 0;
          return s + deposit + balance;
        }
        return s + i.unitPriceCents * i.quantity;
      }, 0),
    0
  );

  // Subscription annual value
  const subAnnualValue = subscriptions.reduce(
    (sum, s) => sum + (s.product.priceCents * (365 / s.intervalDays)),
    0
  );

  // Packaging consumption rate (avg per month last 6 months)
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const recentPackagingSpend = orders
    .filter((o) => o.createdAt >= sixMonthsAgo)
    .reduce((sum, o) =>
      sum + o.items
        .filter((i) => i.product.category === "PACKAGING")
        .reduce((s, i) => s + i.unitPriceCents * i.quantity, 0), 0
    );
  const monthlyPackagingRate = recentPackagingSpend / 6;

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-2">
        Spend analytics
      </h1>
      <p className="text-ash text-sm mb-8">
        Your purchasing data — last 12 months.
      </p>
      <AccountAnalytics
        chartData={chartData}
        packagingTotal={packagingTotal}
        equipmentTotal={equipmentTotal}
        subAnnualValue={subAnnualValue}
        monthlyPackagingRate={monthlyPackagingRate}
        orderCount={orders.length}
      />
    </div>
  );
}