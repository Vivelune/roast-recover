import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createBalanceCheckoutForItem } from "@/app/actions/equipment-checkout";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { notifyAndLog } from "@/lib/notifications";

const itemStatusLabel: Record<string, string> = {
  PENDING_DEPOSIT: "Awaiting deposit",
  AWAITING_BALANCE: "Deposit paid — ready to invoice balance",
  IN_PRODUCTION: "In production",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      user: true,
      shippingAddress: true,
    },
  });
  if (!order) notFound();

  const total = order.items.reduce(
    (sum, i) => sum + i.unitPriceCents * i.quantity, 0
  );

  async function handleStatusUpdate(formData: FormData) {
    "use server";
    const itemId = formData.get("itemId") as string;
    const newStatus = formData.get("status") as string;
    const trackingNumber = (formData.get("trackingNumber") as string) || undefined;
    const trackingUrl = (formData.get("trackingUrl") as string) || undefined;
  
    const item = await prisma.orderItem.update({
      where: { id: itemId },
      data: { itemStatus: newStatus as any },
      include: { product: true },
    });
  
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: item.orderId },
      include: { product: true },
    });
  
    const allDelivered = allItems.every((i) => i.itemStatus === "DELIVERED");
    const allShipped = allItems.every((i) =>
      ["SHIPPED", "DELIVERED"].includes(i.itemStatus ?? "")
    );
    const allInProduction = allItems.every((i) =>
      ["IN_PRODUCTION", "SHIPPED", "DELIVERED"].includes(i.itemStatus ?? "")
    );
    const anyAwaitingBalance = allItems.some(
      (i) => i.itemStatus === "AWAITING_BALANCE"
    );
  
    const newOrderStatus = allDelivered
      ? "DELIVERED"
      : allShipped
      ? "SHIPPED"
      : allInProduction
      ? "IN_PRODUCTION"
      : anyAwaitingBalance
      ? "AWAITING_BALANCE"
      : "PENDING_DEPOSIT";
  
    const updatedOrder = await prisma.order.update({
      where: { id: item.orderId },
      data: { status: newOrderStatus as any },
      include: { user: true, items: { include: { product: true } } },
    });
  
    const ctx = {
      orderId: updatedOrder.id,
      userId: updatedOrder.userId,
      userEmail: updatedOrder.user.email,
      userName: updatedOrder.user.name,
      items: updatedOrder.items.map((i) => ({
        id: i.id,
        product: { name: i.product.name, slug: i.product.slug },
        quantity: i.quantity,
      })),
    };
  
    try {
      if (newStatus === "IN_PRODUCTION") {
        const { sendInProductionEmail } = await import("@/lib/status-emails");
        await sendInProductionEmail(ctx);
      } else if (newStatus === "SHIPPED") {
        const { sendShippedEmail } = await import("@/lib/status-emails");
        await sendShippedEmail(ctx, trackingNumber, trackingUrl);
      } else if (newStatus === "DELIVERED") {
        const { sendDeliveredEmail } = await import("@/lib/status-emails");
        await sendDeliveredEmail(ctx);
  
        const existing = await prisma.equipmentRegistryItem.findFirst({
          where: {
            userId: updatedOrder.userId,
            productId: item.productId,
            orderId: item.orderId,
          },
        });
        if (!existing) {
          await prisma.equipmentRegistryItem.create({
            data: {
              userId: updatedOrder.userId,
              productId: item.productId,
              orderId: item.orderId,
              installedAt: new Date(),
              warrantyEndsAt: new Date(
                Date.now() + 365 * 24 * 60 * 60 * 1000
              ),
            },
          });
        }
      }
    } catch (emailErr) {
      console.error("[admin] Status email failed:", emailErr);
    }
  
    revalidatePath(`/admin/orders/${item.orderId}`);
    revalidatePath(`/account/orders/${item.orderId}`);
    revalidatePath("/admin");
  }
  
  async function handleSendBalance(formData: FormData) {
    "use server";
    const itemId = formData.get("itemId") as string;
    const result = await createBalanceCheckoutForItem(itemId);
  
    // Get order context for notification
    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        order: { include: { user: true } },
      },
    });
  
    if (item) {
      const depositPerUnit = Math.round(
        (item.unitPriceCents * (item.depositPercent ?? 0)) / 100
      );
      const balancePerUnit = item.unitPriceCents - depositPerUnit;
      const totalBalance = balancePerUnit * item.quantity;
  
      // Notify the customer with the payment link
      await notifyAndLog(
        item.order.userId,
        {
          type: "balance_due",
          title: `Balance payment due — ${item.product.name}`,
          body: `$${(totalBalance / 100).toFixed(2)} balance is due. Your machine is ready to ship once payment is received. Click to pay now.`,
          href: result.checkoutUrl ?? `/account/orders/${item.orderId}`,
        },
        {
          type: "balance_due",
          title: `Balance payment link sent for ${item.product.name}`,
          metadata: {
            orderId: item.orderId,
            balanceCents: totalBalance,
            checkoutUrl: result.checkoutUrl,
          },
        }
      );
  
      // Also log it in admin console as fallback
      console.log(
        `[admin] Balance URL for item ${itemId}:`,
        result.checkoutUrl
      );
    }
  
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath(`/account/orders/${item?.orderId ?? ""}`);
  }

  const statusOptions = [
    "PENDING_DEPOSIT", "AWAITING_BALANCE", "IN_PRODUCTION",
    "SHIPPED", "DELIVERED", "CANCELLED",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-ash font-medium mt-1">{order.user.email}</p>
        </div>
        <span className="self-start sm:self-center text-xs uppercase tracking-wider font-bold bg-[#F0ECE6] border border-gray-200 text-char px-3 py-1.5 rounded-full">
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Grid containing details & shipping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Items Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 sm:p-6 border-gray-150 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <p className="text-[11px] uppercase tracking-wider font-bold text-ash mb-5">Order Items</p>
            
            <div className="space-y-6">
              {order.items.map((item, i) => {
                const isEquipment = item.depositPercent !== null;
                const deposit = isEquipment
                  ? Math.round((item.unitPriceCents * (item.depositPercent ?? 0)) / 100)
                  : null;

                return (
                  <div key={item.id} className="group">
                    {i > 0 && <Separator className="my-6" />}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-char">
                          {item.product.name}
                        </p>
                        <p className="text-xs font-semibold text-ash/80 mt-1">
                          Qty: <span className="text-char">{item.quantity}</span>
                          {" · "}${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
                          {deposit !== null && item.depositPaidAt && (
                            <span className="text-emerald-700 font-semibold block sm:inline"> · Deposit Paid (${((deposit * item.quantity) / 100).toFixed(2)})</span>
                          )}
                          {deposit !== null && !item.depositPaidAt && (
                            <span className="text-amber-700 font-semibold block sm:inline"> · Deposit Pending</span>
                          )}
                        </p>
                        {isEquipment && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                            {itemStatusLabel[item.itemStatus ?? "PENDING_DEPOSIT"]}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controls section */}
                    {isEquipment && (
                      <div className="bg-[#FBFBFA] border border-gray-200/60 rounded-lg p-4 space-y-4">
                        <form action={handleStatusUpdate} className="space-y-3">
                          <input type="hidden" name="itemId" value={item.id} />

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <select
                              name="status"
                              defaultValue={item.itemStatus ?? "PENDING_DEPOSIT"}
                              className="border border-gray-200 rounded-lg text-xs px-3 py-2 bg-white text-char font-semibold flex-1 sm:max-w-[180px]"
                            >
                              {statusOptions.map((s) => (
                                <option key={s} value={s}>
                                  {s.replace(/_/g, " ")}
                                </option>
                              ))}
                            </select>

                            <button
                              type="submit"
                              className="bg-char hover:bg-char/90 active:scale-[0.98] transition-all text-white text-xs px-4 py-2 rounded-lg font-bold shadow-sm"
                            >
                              Update Status
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <input
                              name="trackingNumber"
                              placeholder="Tracking number (optional)"
                              className="border border-gray-200 rounded-lg text-xs px-3 py-2 text-char placeholder:text-ash bg-white"
                            />

                            <input
                              name="trackingUrl"
                              placeholder="Tracking URL (optional)"
                              className="border border-gray-200 rounded-lg text-xs px-3 py-2 text-char placeholder:text-ash bg-white"
                            />
                          </div>

                          <p className="text-[10px] text-ash font-medium">
                            Tracking info is included in the shipment email notification when status changes to SHIPPED.
                          </p>
                        </form>

                        {item.itemStatus === "AWAITING_BALANCE" && (
                          <form action={handleSendBalance} className="pt-2">
                            <input type="hidden" name="itemId" value={item.id} />
                            <button
                              type="submit"
                              className="w-full sm:w-auto bg-ember hover:bg-ember-dark text-white text-xs px-4 py-2 rounded-lg font-bold shadow-sm transition-all duration-150"
                            >
                              Send Balance Invoice Link
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <Separator className="my-5" />
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-char">
              <span>Grand Total</span>
              <span className="text-lg text-char">${(total / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </Card>
        </div>

        {/* Sidebar Delivery Address Column */}
        <div className="lg:col-span-1">
          {order.shippingAddress && (
            <Card className="p-5 border-gray-150 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-fit">
              <p className="text-[11px] uppercase tracking-wider font-bold text-ash mb-3">
                Shipping Address
              </p>
              <div className="text-sm text-char leading-relaxed bg-[#FBFBFA] border border-gray-200/50 rounded-lg p-3.5 font-medium">
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && (
                  <p>{order.shippingAddress.line2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
              </div>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}