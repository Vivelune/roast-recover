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
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight mb-2">
          Customers
        </h1>
        <p className="text-sm text-ash">
          Monitor your registered customer directory, track total order values, and review individual user profiles.
        </p>
      </div>
      <CustomersTable data={data} />
    </div>
  );
}