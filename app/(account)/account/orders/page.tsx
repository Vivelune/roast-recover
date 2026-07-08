import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColor: Record<string, string> = {
  PAID: "bg-green-50 text-green-700",
  PENDING_DEPOSIT: "bg-yellow-50 text-yellow-700",
  AWAITING_BALANCE: "bg-blue-50 text-blue-700",
  IN_PRODUCTION: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-50 text-red-700",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ash mb-4">No orders yet.</p>
          <Link href="/packaging" className="text-ember text-sm font-medium">
            Browse packaging →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const total = order.items.reduce(
              (sum, i) => sum + i.unitPriceCents * i.quantity, 0
            );
            return (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <Card className="px-5 py-4 flex items-center justify-between hover:border-ember/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-char truncate">
                      {order.items[0]?.product.name}
                      {order.items.length > 1 &&
                        ` +${order.items.length - 1} more`}
                    </p>
                    <p className="text-xs text-ash mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                      {" · "}${(total / 100).toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-medium ml-4 flex-shrink-0 ${
                      statusColor[order.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}