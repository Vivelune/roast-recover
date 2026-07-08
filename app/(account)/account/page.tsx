import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Package, ClipboardList, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [orders, equipment, subscriptions] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.equipmentRegistryItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    }),
    prisma.subscription.findMany({
      where: { userId: user.id, status: "active" },
      include: { product: true },
    }),
  ]);

  const stats = [
    { label: "Total orders", value: orders.length, icon: ClipboardList, href: "/account/orders" },
    { label: "Equipment owned", value: equipment.length, icon: Package, href: "/account/equipment" },
    { label: "Active subscriptions", value: subscriptions.length, icon: RefreshCw, href: "/account/subscriptions" },
  ];

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-1">
        Welcome back
        {user.name ? `, ${user.name.split(" ")[0]}` : ""}
      </h1>
      <p className="text-ash text-sm mb-8">{user.email}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="p-4 hover:border-ember/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Icon size={16} className="text-ash" />
                <ArrowRight size={13} className="text-ash" />
              </div>
              <p className="font-display font-semibold text-2xl text-char">
                {value}
              </p>
              <p className="text-xs text-ash mt-0.5">{label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-char">Recent orders</p>
          <Link href="/account/orders" className="text-xs text-ember">
            View all →
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-ash">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <Card className="px-4 py-3 flex items-center justify-between hover:border-ember/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-char">
                      {order.items[0]?.product.name}
                      {order.items.length > 1 &&
                        ` +${order.items.length - 1} more`}
                    </p>
                    <p className="text-xs text-ash">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-ash bg-steam px-2 py-1 rounded-md">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}