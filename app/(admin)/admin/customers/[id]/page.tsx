import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      },
      addresses: true,
      subscriptions: { include: { product: true } },
    },
  });

  if (!customer) notFound();

  const totalSpend = customer.orders.reduce(
    (sum, o) =>
      sum + o.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0),
    0
  );

  const statusColor: Record<string, string> = {
    PAID: "bg-green-50 text-green-700",
    PENDING_DEPOSIT: "bg-yellow-50 text-yellow-700",
    AWAITING_BALANCE: "bg-blue-50 text-blue-700",
    IN_PRODUCTION: "bg-purple-50 text-purple-700",
    SHIPPED: "bg-indigo-50 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-50 text-red-700",
  };

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm text-ash hover:text-char mb-6"
      >
        <ArrowLeft size={14} /> Back to customers
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char mb-1">
            {customer.name ?? customer.email}
          </h1>
          <p className="text-sm text-ash flex items-center gap-1.5">
            <Mail size={13} /> {customer.email}
          </p>
        </div>
        <Badge variant={customer.role === "ADMIN" ? "default" : "outline"}>
          {customer.role}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total orders", value: customer.orders.length },
          { label: "Total spend", value: `$${(totalSpend / 100).toFixed(2)}` },
          { label: "Subscriptions", value: customer.subscriptions.length },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4 text-center">
            <p className="font-display font-semibold text-xl text-char">{value}</p>
            <p className="text-xs text-ash mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Order history */}
      <Card className="p-5 mb-6">
        <p className="text-xs uppercase tracking-wide text-ash mb-4">Order history</p>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-ash">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {customer.orders.map((order) => {
              const total = order.items.reduce(
                (sum, i) => sum + i.unitPriceCents * i.quantity, 0
              );
              return (
                <div key={order.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-ember hover:underline"
                      >
                        {order.items[0]?.product.name}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </Link>
                      <p className="text-xs text-ash mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                        ${(total / 100).toFixed(2)}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${statusColor[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <Separator className="mt-3" />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Addresses */}
      {customer.addresses.length > 0 && (
        <Card className="p-5 mb-6">
          <p className="text-xs uppercase tracking-wide text-ash mb-4">Addresses</p>
          <div className="space-y-2">
            {customer.addresses.map((addr) => (
              <p key={addr.id} className="text-sm text-char">
                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""},{" "}
                {addr.city}, {addr.state} {addr.zip}
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Subscriptions */}
      {customer.subscriptions.length > 0 && (
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-ash mb-4">Subscriptions</p>
          <div className="space-y-2">
            {customer.subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between text-sm">
                <span className="text-char">{sub.product.name}</span>
                <Badge
                  variant="outline"
                  className={sub.status === "active" ? "bg-green-50 text-green-700 border-green-200" : ""}
                >
                  {sub.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}