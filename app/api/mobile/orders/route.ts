import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileAdmin } from "@/lib/mobile-auth";

export async function GET(req: Request) {
  const adminCheck = await requireMobileAdmin();
  if (adminCheck.error) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "0");
  const limit = 20;

  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: page * limit,
      include: {
        items: { include: { product: { select: { name: true } } } },
        user: { select: { email: true, name: true } },
        shippingAddress: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      shortId: o.id.slice(-8).toUpperCase(),
      status: o.status,
      email: o.user.email,
      name: o.user.name,
      firstItem: o.items[0]?.product.name ?? "—",
      itemCount: o.items.length,
      total: o.items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0),
      createdAt: o.createdAt.toISOString(),
    })),
    total,
    page,
    hasMore: (page + 1) * limit < total,
  });
}