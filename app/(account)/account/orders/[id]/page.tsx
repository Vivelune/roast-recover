import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Clock, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CartClearer from "@/components/CartClearer";
import InvoiceButton from "@/components/InvoiceButton";




export const dynamic = "force-dynamic"; // ← prevents caching of this page
export const revalidate = 0;

const itemStatusLabel: Record<string, { label: string; color: string }> = {
  PENDING_DEPOSIT:  { label: "Awaiting deposit",              color: "text-yellow-600 bg-yellow-50" },
  AWAITING_BALANCE: { label: "Deposit paid — balance due",    color: "text-blue-600 bg-blue-50" },
  IN_PRODUCTION:    { label: "In production",                 color: "text-purple-600 bg-purple-50" },
  SHIPPED:          { label: "Shipped",                       color: "text-indigo-600 bg-indigo-50" },
  DELIVERED:        { label: "Delivered",                     color: "text-green-600 bg-green-50" },
  CANCELLED:        { label: "Cancelled",                     color: "text-red-600 bg-red-50" },
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const { success } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id, userId: user.id },
    include: {
      items: { include: { product: true } },
      shippingAddress: true,
    },
  });

  if (!order) notFound();

  const total = order.items.reduce(
    (sum, i) => sum + i.unitPriceCents * i.quantity, 0
  );
  const isEquipmentOrder = order.items.some((i) => i.depositPercent !== null);

  return (
    <div>
      {/* Success banner */}
      {success && (
  <>
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 mb-6 text-sm">
      <CheckCircle2 size={16} />
      Payment confirmed — your order is being processed.
    </div>
    {/* Clear the right cart based on order type */}
    <CartClearer type={isEquipmentOrder ? "equipment" : "packaging"} />
  </>
)}
      

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char mb-1">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-ash">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
        <span className="text-xs uppercase tracking-wide bg-steam text-ash px-3 py-1.5 rounded-md">
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Items */}
      <Card className="p-5 mb-6">
        <p className="text-xs uppercase tracking-wide text-ash mb-4">Items</p>
        <div className="space-y-4">
          {order.items.map((item) => {
            const isEquipment = item.depositPercent !== null;
            const statusInfo = item.itemStatus
              ? itemStatusLabel[item.itemStatus]
              : null;
            const deposit = isEquipment
              ? Math.round((item.unitPriceCents * (item.depositPercent ?? 0)) / 100)
              : null;

              const depositPercent = item.depositPercent ?? 0;
const depositPaid = depositPercent > 0
  ? Math.round((item.unitPriceCents * depositPercent) / 100) * item.quantity
  : null;
const balanceOwed = depositPaid !== null
  ? (item.unitPriceCents * item.quantity) - depositPaid
  : null;

            return (
              <div key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-char">
                      {item.product.name}
                      <span className="text-ash font-normal"> × {item.quantity}</span>
                    </p>
                    {isEquipment && statusInfo && (
                      <p className={`text-xs mt-0.5 ${statusInfo.color}`}>
                        {statusInfo.label}
                      </p>
                    )}
                    {item.estimatedShipDate && (
                      <p className="text-xs text-ash flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        Est. ship:{" "}
                        {new Date(item.estimatedShipDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-char">
                      ${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
                    </p>
                    {isEquipment && deposit !== null && (
                      <p className="text-xs text-ash">
                        ${((deposit * item.quantity) / 100).toFixed(2)} deposit paid
                      </p>
                    )}
                    {depositPaid !== null && (
  <p className="text-xs text-ash">
    ${(depositPaid / 100).toFixed(2)} deposit paid
    {item.itemStatus === "AWAITING_BALANCE" && balanceOwed && (
      <span className="text-blue-600"> · ${(balanceOwed / 100).toFixed(2)} balance due</span>
    )}
  </p>
)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between text-sm font-semibold text-char">
          <span>{isEquipmentOrder ? "Total equipment value" : "Total"}</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>
      </Card>


      {(order.status === "PAID" ||
  order.status === "IN_PRODUCTION" ||
  order.status === "SHIPPED" ||
  order.status === "DELIVERED") && (
  <InvoiceButton orderId={order.id} />
)}

      {/* Shipping address */}
      {order.shippingAddress && (
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-ash mb-3 flex items-center gap-1.5">
            <Package size={12} /> Shipping to
          </p>
          <p className="text-sm text-char leading-relaxed">
            {order.shippingAddress.line1}
            {order.shippingAddress.line2
              ? `, ${order.shippingAddress.line2}`
              : ""}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.zip}
          </p>
        </Card>
      )}
    </div>
  );
}