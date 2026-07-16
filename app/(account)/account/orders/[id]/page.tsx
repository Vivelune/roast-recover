import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Clock, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CartClearer from "@/components/CartClearer";
import InvoiceButton from "@/components/InvoiceButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const itemStatusLabel: Record<string, { label: string; color: string }> = {
  PENDING_DEPOSIT:  { label: "Awaiting deposit",              color: "text-yellow-700 bg-yellow-50 border-yellow-200/30" },
  AWAITING_BALANCE: { label: "Deposit paid — balance due",    color: "text-blue-700 bg-blue-50 border-blue-200/30" },
  IN_PRODUCTION:    { label: "In production",                 color: "text-purple-700 bg-purple-50 border-purple-200/30" },
  SHIPPED:          { label: "Shipped",                       color: "text-indigo-700 bg-indigo-50 border-indigo-200/30" },
  DELIVERED:        { label: "Delivered",                     color: "text-green-700 bg-green-50 border-green-200/30" },
  CANCELLED:        { label: "Cancelled",                     color: "text-red-700 bg-red-50 border-red-200/30" },
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success banner */}
      {success && (
        <>
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-200/60 text-green-800 rounded-xl px-4 py-3.5 text-xs font-semibold">
            <CheckCircle2 size={16} className="text-green-600 shrink-0" />
            Payment confirmed — your order is being processed.
          </div>
          <CartClearer type={isEquipmentOrder ? "equipment" : "packaging"} />
        </>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char tracking-tight">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-ash font-medium mt-1">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-steam border border-gray-250/50 text-char px-3 py-1.5 rounded-lg self-start sm:self-auto">
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Item Summary Card */}
      <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ash">
          Line items
        </p>
        
        <div className="divide-y divide-gray-100">
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
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-char leading-snug">
                      {item.product.name}
                      <span className="text-ash font-medium"> × {item.quantity}</span>
                    </p>
                    
                    {isEquipment && statusInfo && (
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    )}

                    {item.estimatedShipDate && (
                      <p className="text-[11px] text-ash font-medium flex items-center gap-1">
                        <Clock size={12} className="text-[#B5481F]" />
                        Est. dispatch:{" "}
                        {new Date(item.estimatedShipDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-sm font-bold text-char">
                      ${((item.unitPriceCents * item.quantity) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    
                    {depositPaid !== null && (
                      <div className="text-[11px] font-medium text-ash">
                        <p>${(depositPaid / 100).toFixed(2)} deposit paid</p>
                        {item.itemStatus === "AWAITING_BALANCE" && balanceOwed && (
                          <p className="text-[#B5481F] font-semibold">
                            ${(balanceOwed / 100).toFixed(2)} balance due
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="border-gray-100" />
        
        <div className="flex justify-between items-center text-sm font-bold text-char pt-1">
          <span>{isEquipmentOrder ? "Total Equipment Value" : "Amount Paid"}</span>
          <span className="text-base text-[#B5481F] font-display">
            ${(total / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      {/* Financial documents and tools panel */}
      {(order.status === "PAID" ||
        order.status === "IN_PRODUCTION" ||
        order.status === "SHIPPED" ||
        order.status === "DELIVERED") && (
        <div className="flex justify-start">
          <InvoiceButton orderId={order.id} />
        </div>
      )}

      {/* Shipping Address */}
      {order.shippingAddress && (
        <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ash flex items-center gap-1.5">
            <Package size={13} className="text-[#B5481F]" /> Shipping Location
          </p>
          <p className="text-xs font-semibold text-char leading-relaxed">
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