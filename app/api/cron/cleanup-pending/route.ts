import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Find abandoned orders
  const abandoned = await prisma.order.findMany({
    where: {
      status: { in: ["PENDING", "PENDING_DEPOSIT"] },
      depositPaidAt: null,
      createdAt: { lt: cutoff },
    },
    select: { id: true },
  });

  const ids = abandoned.map((o) => o.id);

  if (ids.length > 0) {
    // Delete items first (foreign key constraint)
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: ids } },
    });
    await prisma.order.deleteMany({
      where: { id: { in: ids } },
    });
  }

  console.log(`[cron] Cleaned up ${ids.length} abandoned orders`);
  return NextResponse.json({ deleted: ids.length });
}