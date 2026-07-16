import { prisma } from "@/lib/prisma";
import RevenueChart from "@/components/admin/RevenueChart";
import { Card } from "@/components/ui/card";
import {
  DollarSign, ShoppingBag, Wrench, AlertTriangle, Factory, ArrowRight,
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

  function calcRevenue(orders: typeof revenueOrders): number {
    return orders.reduce((sum, o) => {
      return (
        sum +
        o.items.reduce((s, i) => {
          if (i.depositPercent) {
            const deposit =
              Math.round((i.unitPriceCents * i.depositPercent) / 100) *
              i.quantity;
            const balance =
              i.balancePaidAt !== null
                ? i.unitPriceCents * i.quantity - deposit
                : 0;
            return s + deposit + balance;
          }
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
      value: `$${(totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      sub: "deposits + packaging",
      alert: false,
      href: undefined,
    },
    {
      label: "Pending deposit",
      value: pendingDepositCount,
      icon: ShoppingBag,
      sub: "awaiting deposit",
      href: "/admin/orders?status=PENDING_DEPOSIT",
      alert: pendingDepositCount > 0,
    },
    {
      label: "Awaiting balance",
      value: awaitingBalanceCount,
      icon: Wrench,
      sub: "ready to invoice",
      href: "/admin/orders?status=AWAITING_BALANCE",
      alert: awaitingBalanceCount > 0,
    },
    {
      label: "In production",
      value: inProductionCount,
      icon: Factory,
      sub: "being built",
      href: "/admin/orders?status=IN_PRODUCTION",
      alert: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
          Admin Overview
        </h1>
        <p className="text-xs sm:text-sm text-ash mt-1">Real-time site metrics and actions.</p>
      </div>

      {/* Stat Cards - Fluid Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, sub, href, alert }) => {
          const inner = (
            <Card
              className={`p-5 h-full flex flex-col justify-between transition-all duration-200 ${
                alert
                  ? "border-amber-300 bg-amber-50/20 shadow-[0_4px_12px_rgba(245,158,11,0.02)]"
                  : "border-gray-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${alert ? "bg-amber-100/50 text-amber-600" : "bg-steam/40 text-ash"}`}>
                    <Icon size={16} />
                  </div>
                  {href && (
                    <ArrowRight size={13} className={`${alert ? "text-amber-500" : "text-ash/40"}`} />
                  )}
                </div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-char tracking-tight">
                  {value}
                </p>
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-char">{label}</p>
                <p className="text-[11px] text-ash/80 mt-0.5">{sub}</p>
              </div>
            </Card>
          );

          return href ? (
            <Link key={label} href={href} className="block group">
              {inner}
            </Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>

      {/* Revenue Chart Widget */}
      <Card className="p-5 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <p className="text-sm font-semibold text-char">Revenue Timeline</p>
            <p className="text-[11px] text-ash mt-0.5">Rolling earnings over the last 14 days</p>
          </div>
          <p className="text-[11px] font-medium text-ash bg-steam px-2.5 py-1 rounded-full self-start">
            Packaging + Equipment Deposits
          </p>
        </div>
        <div className="h-60 w-full">
          <RevenueChart data={revenueByDay} />
        </div>
      </Card>

      {/* Low Stock Notifications */}
      {filteredLowStockProducts.length > 0 && (
        <Card className="p-5 border-amber-200 bg-amber-50/20 shadow-[0_2px_12px_rgba(245,158,11,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-char flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600" />
              Stock Alerts
            </p>
            <Link href="/admin/products" className="text-xs font-bold text-amber-700 hover:underline">
              Manage Inventory →
            </Link>
          </div>

          <div className="divide-y divide-amber-200/40">
            {filteredLowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 text-xs sm:text-sm first:pt-0 last:pb-0">
                <span className="font-medium text-char truncate max-w-[70%]">{p.name}</span>
                <span className={`font-semibold ${p.stockQty === 0 ? "text-red-600" : "text-amber-700"}`}>
                  {p.stockQty === 0 ? "Out of Stock" : `${p.stockQty} remaining`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Orders List Card */}
      <Card className="p-5 border-gray-150 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-char">Recent Orders</p>
            <p className="text-[11px] text-ash mt-0.5">Most recent checkout acquisitions</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-semibold text-ember hover:underline">
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-ash py-8 text-center">No orders created yet.</p>
        ) : (
          /* Mobile Friendly Responsive Table Box */
          <div className="overflow-x-auto -mx-5 px-5">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full text-xs sm:text-sm divide-y divide-gray-100">
                <thead>
                  <tr className="text-[11px] text-ash uppercase tracking-wider text-left">
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Product Items</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/60">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-steam/10 transition-colors">
                      <td className="py-3.5 pr-2 font-medium">
                        <Link href={`/admin/orders/${order.id}`} className="text-ember hover:underline font-semibold block truncate max-w-[140px] sm:max-w-none">
                          {order.user.email}
                        </Link>
                      </td>
                      <td className="py-3.5 px-1 text-char font-medium truncate max-w-[150px] sm:max-w-none">
                        {order.items[0]?.product.name}
                        {order.items.length > 1 && (
                          <span className="text-ash font-normal"> +{order.items.length - 1} more</span>
                        )}
                      </td>
                      <td className="py-3.5 px-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ash bg-steam px-2 py-0.5 rounded-full whitespace-nowrap">
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 pl-2 text-ash text-right whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}