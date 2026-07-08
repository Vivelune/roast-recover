import { prisma } from "@/lib/prisma";
import OrdersTable from "@/components/admin/OrdersTable";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: "desc" },
  });

  const data = orders.map((o) => ({
    id: o.id,
    email: o.user.email,
    firstItem: o.items[0]?.product.name ?? "—",
    itemCount: o.items.length,
    status: o.status,
    total: o.items.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity, 0
    ),
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        Orders
      </h1>
      <OrdersTable data={data} />
    </div>
  );
}