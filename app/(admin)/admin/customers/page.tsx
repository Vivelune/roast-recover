import { prisma } from "@/lib/prisma";
import CustomersTable from "@/components/admin/CustomersTable";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    include: {
      orders: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = users.map((u) => {
    const totalSpend = u.orders.reduce(
      (sum, o) =>
        sum + o.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0),
      0
    );
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      orderCount: u.orders.length,
      totalSpend,
      lastOrderDate: u.orders[0]?.createdAt.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    };
  });

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        Customers
      </h1>
      <CustomersTable data={data} />
    </div>
  );
}