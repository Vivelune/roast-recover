import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PackageOpen } from "lucide-react";

const statusColor: Record<string, string> = {
  PAID: "bg-green-50 border-green-200/50 text-green-700",
  PENDING_DEPOSIT: "bg-yellow-50 border-yellow-200/50 text-yellow-700",
  AWAITING_BALANCE: "bg-blue-50 border-blue-200/50 text-blue-700",
  IN_PRODUCTION: "bg-purple-50 border-purple-200/50 text-purple-700",
  SHIPPED: "bg-indigo-50 border-indigo-200/50 text-indigo-700",
  DELIVERED: "bg-green-100/60 border-green-200/60 text-green-800",
  CANCELLED: "bg-red-50 border-red-200/50 text-red-700",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
      OR: [
        {
          status: {
            notIn: ["PENDING", "PENDING_DEPOSIT"],
          },
        },
        {
          status: "PENDING_DEPOSIT",
          depositPaidAt: { not: null },
        },
      ],
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="font-display font-semibold text-2xl text-char tracking-tight">
          Purchase History
        </h1>
        <p className="text-ash text-sm mt-0.5">
          View invoices, tracking coordinates, and fulfillment cycles.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-2xl bg-white">
          <div className="w-12 h-12 rounded-2xl bg-steam flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <PackageOpen size={20} className="text-[#B5481F]" />
          </div>
          <p className="text-char font-semibold">No transactions recorded yet</p>
          <p className="text-ash text-xs mt-1 mb-6 max-w-xs mx-auto">
            Once you place your first roast equipment order or packaging run, details will sync here.
          </p>
          <Link 
            href="/packaging" 
            className="inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white bg-[#B5481F] hover:bg-[#9E3E1A] transition-colors h-10 px-6 rounded-xl"
          >
            Browse Solutions
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const total = order.items.reduce(
              (sum, i) => sum + i.unitPriceCents * i.quantity, 0
            );
            return (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block group">
                <Card className="px-6 py-5 flex items-center justify-between border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white group-hover:border-[#B5481F]/30 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-bold text-char truncate group-hover:text-[#B5481F] transition-colors">
                      {order.items[0]?.product.name}
                      {order.items.length > 1 &&
                        ` +${order.items.length - 1} more`}
                    </p>
                    <p className="text-xs text-ash font-medium mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                      {" · "}${(total / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border shrink-0 ${
                      statusColor[order.status] ?? "bg-gray-50 border-gray-200 text-gray-600"
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