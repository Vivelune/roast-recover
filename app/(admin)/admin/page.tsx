import { prisma } from "@/lib/prisma";
import RevenueChart from "@/components/admin/RevenueChart";
import { Card } from "@/components/ui/card";
import {
  DollarSign, ShoppingBag, Wrench, AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const [
    paidOrders,
    pendingDepositOrders,
    awaitingBalanceOrders,
    expiringCerts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { status: "PAID", createdAt: { gte: thirtyDaysAgo } },
      include: { items: true },
    }),
    prisma.order.count({ where: { status: "PENDING_DEPOSIT" } }),
    prisma.order.count({ where: { status: "AWAITING_BALANCE" } }),
    prisma.certification.findMany({
      where: { expiresAt: { lte: sixtyDaysFromNow } },
      include: { products: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { include: { product: true } }, user: true },
    }),
  ]);

  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0),
    0
  );

  // Build daily revenue data for chart (last 14 days)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });

  const revenueByDay = days.map((day) => ({
    date: day.slice(5), // MM-DD
    revenue: paidOrders
      .filter((o) => o.createdAt.toISOString().startsWith(day))
      .reduce(
        (sum, o) =>
          sum + o.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0),
        0
      ) / 100,
  }));

  const stats = [
    {
      label: "Revenue (30d)",
      value: `$${(totalRevenue / 100).toFixed(0)}`,
      icon: DollarSign,
      sub: "from paid orders",
    },
    {
      label: "Pending deposit",
      value: pendingDepositOrders,
      icon: ShoppingBag,
      sub: "need action",
      href: "/admin/orders?status=PENDING_DEPOSIT",
      alert: pendingDepositOrders > 0,
    },
    {
      label: "Awaiting balance",
      value: awaitingBalanceOrders,
      icon: Wrench,
      sub: "ready to invoice",
      href: "/admin/orders?status=AWAITING_BALANCE",
      alert: awaitingBalanceOrders > 0,
    },
    {
      label: "Certs expiring",
      value: expiringCerts.length,
      icon: AlertTriangle,
      sub: "within 60 days",
      href: "/admin/certifications",
      alert: expiringCerts.length > 0,
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
              className={`p-4 ${alert ? "border-amber-300 bg-amber-50/30" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon
                  size={16}
                  className={alert ? "text-amber-500" : "text-ash"}
                />
              </div>
              <p className="font-display font-semibold text-2xl text-char">
                {value}
              </p>
              <p className="text-xs text-ash mt-0.5">{label}</p>
              <p className="text-xs text-ash/60 mt-0.5">{sub}</p>
            </Card>
          );
          return href ? (
            <Link key={label} href={href}>{inner}</Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>

      {/* Revenue chart */}
      <Card className="p-5 mb-8">
        <p className="text-sm font-medium text-char mb-4">
          Revenue — last 14 days
        </p>
        <RevenueChart data={revenueByDay} />
      </Card>

      {/* Recent orders */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-char">Recent orders</p>
          <Link href="/admin/orders" className="text-xs text-ember">
            View all →
          </Link>
        </div>
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
              <tr key={order.id} className="border-b border-border/50 last:border-0">
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
      </Card>
    </div>
  );
}