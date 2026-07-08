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
    const status = formData.get("status") as string;
    await prisma.orderItem.update({
      where: { id: itemId },
      data: { itemStatus: status as any },
    });
    revalidatePath(`/admin/orders/${id}`);
  }

  async function handleSendBalance(formData: FormData) {
    "use server";
    const itemId = formData.get("itemId") as string;
    const { checkoutUrl } = await createBalanceCheckoutForItem(itemId);
    // In production: email this URL to customer via Resend
    // For now: logged to console so you can test it manually
    console.log("Balance checkout URL for item", itemId, ":", checkoutUrl);
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
                      {deposit !== null &&
                        ` · $${((deposit * item.quantity) / 100).toFixed(2)} deposit paid`}
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