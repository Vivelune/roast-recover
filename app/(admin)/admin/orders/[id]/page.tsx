import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createBalanceCheckoutForItem } from "@/app/actions/equipment-checkout";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

  // 1. Update the specific item
  const item = await prisma.orderItem.update({
    where: { id: itemId },
    data: { itemStatus: newStatus as any },
  });

  // 2. Re-read all items to calculate new order status
  const allItems = await prisma.orderItem.findMany({
    where: { orderId: item.orderId },
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

  // 3. Update order status
  await prisma.order.update({
    where: { id: item.orderId },
    data: { status: newOrderStatus as any },
  });

  // 4. If marked DELIVERED → create equipment registry entry
  if (newStatus === "DELIVERED") {
    const deliveredItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });

    if (deliveredItem) {
      // Check if registry entry already exists to avoid duplicates
      const existing = await prisma.equipmentRegistryItem.findFirst({
        where: {
          userId: deliveredItem.order.userId,
          productId: deliveredItem.productId,
          orderId: deliveredItem.orderId,
        },
      });

      if (!existing) {
        await prisma.equipmentRegistryItem.create({
          data: {
            userId: deliveredItem.order.userId,
            productId: deliveredItem.productId,
            orderId: deliveredItem.orderId,
            installedAt: new Date(),
            warrantyEndsAt: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ),
          },
        });
      }
    }

    revalidatePath("/account/equipment");
  }

  // 5. Revalidate both admin and customer views
  revalidatePath(`/admin/orders/${item.orderId}`);
  revalidatePath(`/account/orders/${item.orderId}`);
  revalidatePath("/admin");
}
  
  async function handleSendBalance(formData: FormData) {
    "use server";
    const itemId = formData.get("itemId") as string;
    const result = await createBalanceCheckoutForItem(itemId);
    // Email is now sent inside createBalanceCheckoutForItem
    // Log URL as fallback
    console.log(`[admin] Balance URL for item ${itemId}:`, result.checkoutUrl);
    revalidatePath(`/admin/orders/${id}`);
  }
  const statusOptions = [
    "PENDING_DEPOSIT", "AWAITING_BALANCE", "IN_PRODUCTION",
    "SHIPPED", "DELIVERED", "CANCELLED",
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char mb-1">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-ash">{order.user.email}</p>
        </div>
        <span className="text-xs uppercase tracking-wide bg-steam text-ash px-3 py-1.5 rounded-md">
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      <Card className="p-5 mb-6">
        <p className="text-xs uppercase tracking-wide text-ash mb-4">Items</p>
        <div className="space-y-5">
          {order.items.map((item, i) => {
            const isEquipment = item.depositPercent !== null;
            const deposit = isEquipment
              ? Math.round((item.unitPriceCents * (item.depositPercent ?? 0)) / 100)
              : null;

            return (
              <div key={item.id}>
                {i > 0 && <Separator className="mb-5" />}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-char">
                      {item.product.name} × {item.quantity}
                    </p>
                    <p className="text-xs text-ash mt-0.5">
  ${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
  {deposit !== null && item.depositPaidAt && (
    ` · $${((deposit * item.quantity) / 100).toFixed(2)} deposit received`
  )}
  {deposit !== null && !item.depositPaidAt && (
    ` · $${((deposit * item.quantity) / 100).toFixed(2)} deposit pending`
  )}
</p>
                    {isEquipment && (
                      <p className="text-xs text-blue-600 mt-1">
                        {itemStatusLabel[item.itemStatus ?? "PENDING_DEPOSIT"]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Per-item controls for equipment */}
                {isEquipment && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Update item status */}
                    <form action={handleStatusUpdate} className="flex items-center gap-2">
                      <input type="hidden" name="itemId" value={item.id} />
                      <select
                        name="status"
                        defaultValue={item.itemStatus ?? "PENDING_DEPOSIT"}
                        className="border border-border rounded-md text-xs px-2.5 py-1.5 bg-white text-char"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="bg-graphite text-white text-xs px-3 py-1.5 rounded-md"
                      >
                        Update
                      </button>
                    </form>

                    {/* Send balance link — only shown when deposit is paid */}
                    {item.itemStatus === "AWAITING_BALANCE" && (
                      <form action={handleSendBalance}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className="bg-ember text-white text-xs px-3 py-1.5 rounded-md"
                        >
                          Send balance payment link
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between text-sm font-semibold text-char">
          <span>Total</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>
      </Card>

      {order.shippingAddress && (
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-ash mb-3">
            Shipping address
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