import { prisma } from "@/lib/prisma";
import RevenueChart from "@/components/admin/RevenueChart";
import { Card } from "@/components/ui/card";
import {
  DollarSign, ShoppingBag, Wrench, AlertTriangle, Factory,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const [
    revenueOrders,
    actionRequiredOrders,
    expiringCerts,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: {
          in: ["PAID", "AWAITING_BALANCE", "IN_PRODUCTION", "SHIPPED", "DELIVERED"],
        },
      },
      include: { items: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: {
        status: { in: ["PENDING_DEPOSIT", "AWAITING_BALANCE", "IN_PRODUCTION"] },
      },
      _count: true,
    }),
    prisma.certification.findMany({
      where: { expiresAt: { lte: sixtyDaysFromNow } },
      include: { products: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { include: { product: true } }, user: true },
    }),
    prisma.product.findMany({
      where: {
        category: "PACKAGING",
        active: true,
        stockQty: {
          not: null,
        },
      },
      orderBy: {
        stockQty: "asc",
      },
    }),
  ]);

  // Extract counts from groupBy result
  const statusCounts = actionRequiredOrders.reduce(
    (acc, g) => ({ ...acc, [g.status]: g._count }),
    {} as Record<string, number>
  );
  const pendingDepositCount = statusCounts["PENDING_DEPOSIT"] ?? 0;
  const awaitingBalanceCount = statusCounts["AWAITING_BALANCE"] ?? 0;
  const inProductionCount = statusCounts["IN_PRODUCTION"] ?? 0;

  // Revenue = money actually collected
  function calcRevenue(orders: typeof revenueOrders): number {
    return orders.reduce((sum, o) => {
      return (
        sum +
        o.items.reduce((s, i) => {
          if (i.depositPercent) {
            // Equipment: deposit is always collected once order exists here
            const deposit =
              Math.round((i.unitPriceCents * i.depositPercent) / 100) *
              i.quantity;
            // Add balance only if it's actually been paid
            const balance =
              i.balancePaidAt !== null
                ? i.unitPriceCents * i.quantity - deposit
                : 0;
            return s + deposit + balance;
          }
          // Packaging: full price collected
          return s + i.unitPriceCents * i.quantity;
        }, 0)
      );
    }, 0);
  }

  const totalRevenue = calcRevenue(revenueOrders);
  const filteredLowStockProducts = lowStockProducts.filter(
    (p) =>
      p.stockQty !== null &&
      p.stockQty <= (p.lowStockThreshold ?? 10)
  );

  // Last 14 days for chart
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });

  const revenueByDay = days.map((day) => ({
    date: day.slice(5),
    revenue:
      calcRevenue(
        revenueOrders.filter((o) => o.createdAt.toISOString().startsWith(day))
      ) / 100,
  }));

  const stats = [
    {
      label: "Revenue (30d)",
      value: `$${(totalRevenue / 100).toFixed(0)}`,
      icon: DollarSign,
      sub: "deposits + packaging collected",
      alert: false,
      href: undefined,
    },
    {
      label: "Pending deposit",
      value: pendingDepositCount,
      icon: ShoppingBag,
      sub: "awaiting deposit payment",
      href: "/admin/orders?status=PENDING_DEPOSIT",
      alert: pendingDepositCount > 0,
    },
    {
      label: "Awaiting balance",
      value: awaitingBalanceCount,
      icon: Wrench,
      sub: "ready to invoice balance",
      href: "/admin/orders?status=AWAITING_BALANCE",
      alert: awaitingBalanceCount > 0,
    },
    {
      label: "In production",
      value: inProductionCount,
      icon: Factory,
      sub: "balance paid, being built",
      href: "/admin/orders?status=IN_PRODUCTION",
      alert: false,
    },
  ];

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        Overview
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, sub, href, alert }) => {
          const inner = (
            <Card
              className={`p-4 h-full ${
                alert ? "border-amber-300 bg-amber-50/30" : ""
              }`}
            >
              <div className="mb-3">
                <Icon
                  size={16}
                  className={alert ? "text-amber-500" : "text-ash"}
                />
              </div>
              <p className="font-display font-semibold text-2xl text-char">
                {value}
              </p>
              <p className="text-xs font-medium text-ash mt-0.5">{label}</p>
              <p className="text-xs text-ash/60 mt-0.5">{sub}</p>
            </Card>
          );
          return href ? (
            <Link key={label} href={href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>

      {/* Revenue chart */}
      <Card className="p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-char">Revenue — last 14 days</p>
          <p className="text-xs text-ash">
            Packaging (full) + Equipment (deposit)
          </p>
        </div>
        <RevenueChart data={revenueByDay} />
      </Card>

      {/* Low stock alerts */}
{filteredLowStockProducts.length > 0 && (
  <Card className="p-5 mb-8 border-amber-300 bg-amber-50/20">
    <div className="flex items-center justify-between mb-3">
  <p className="text-sm font-medium text-char flex items-center gap-2">
    <AlertTriangle size={15} className="text-amber-500" />
    Stock alerts
  </p>

  <Link
    href="/admin/products"
    className="text-xs text-ember hover:underline"
  >
    Manage inventory →
  </Link>
</div>

    <div className="space-y-2">
      {filteredLowStockProducts.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between text-sm"
        >
          <span className="text-char">
            {p.name}
          </span>

          <span
            className={`font-medium ${
              p.stockQty === 0
                ? "text-red-600"
                : "text-amber-600"
            }`}
          >
            {p.stockQty === 0
              ? "Out of stock"
              : `${p.stockQty} remaining`}
          </span>
        </div>
      ))}
    </div>
  </Card>
)}

      {/* Recent orders */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-char">Recent orders</p>
          <Link href="/admin/orders" className="text-xs text-ember">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-ash py-4 text-center">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-ash border-b border-border">
                <th className="text-left pb-2 font-medium">Customer</th>
                <th className="text-left pb-2 font-medium">Item</th>
                <th className="text-left pb-2 font-medium">Status</th>
                <th className="text-left pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-ember hover:underline"
                    >
                      {order.user.email}
                    </Link>
                  </td>
                  <td className="py-2.5 text-char">
                    {order.items[0]?.product.name}
                    {order.items.length > 1 && (
                      <span className="text-ash"> +{order.items.length - 1}</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <span className="text-xs uppercase tracking-wide text-ash bg-steam px-2 py-0.5 rounded">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2.5 text-ash">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}