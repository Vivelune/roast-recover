import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileAdmin } from "@/lib/mobile-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireMobileAdmin();
  if (adminCheck.error) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      user: true,
      shippingAddress: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireMobileAdmin();
  if (adminCheck.error) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { id } = await params;
  const { itemId, status } = await req.json();

  if (!itemId || !status) {
    return NextResponse.json(
      { error: "itemId and status required" },
      { status: 400 }
    );
  }

  const item = await prisma.orderItem.update({
    where: { id: itemId },
    data: { itemStatus: status },
  });

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

  await prisma.order.update({
    where: { id: item.orderId },
    data: { status: newOrderStatus as any },
  });

  return NextResponse.json({ ok: true, newOrderStatus });
}