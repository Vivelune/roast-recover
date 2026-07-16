import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Package, MapPin, CalendarDays } from "lucide-react";
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
    PAID: "bg-green-50 text-green-700 border-green-200",
    PENDING_DEPOSIT: "bg-amber-50 text-amber-700 border-amber-200",
    AWAITING_BALANCE: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PRODUCTION: "bg-purple-50 text-purple-700 border-purple-200",
    SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Back Link */}
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ash hover:text-char transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to customers
      </Link>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="space-y-1.5">
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
            {customer.name ?? customer.email}
          </h1>
          <p className="text-sm text-ash flex items-center gap-2 font-medium">
            <Mail size={14} className="text-gray-400" /> {customer.email}
          </p>
        </div>
        <div>
          <Badge 
            variant={customer.role === "ADMIN" ? "default" : "outline"}
            className="rounded-lg px-3 py-1 text-xs font-semibold"
          >
            {customer.role}
          </Badge>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total orders", value: customer.orders.length },
          { label: "Total spend", value: `$${(totalSpend / 100).toFixed(2)}` },
          { label: "Subscriptions", value: customer.subscriptions.length },
        ].map(({ label, value }) => (
          <Card key={label} className="p-5 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ash">{label}</p>
            <p className="font-display font-bold text-2xl text-char mt-1.5">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Column - Order History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ash mb-5 flex items-center gap-1.5">
              <Package size={14} /> Order History
            </p>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-ash italic py-2">No orders recorded for this profile.</p>
            ) : (
              <div className="space-y-4">
                {customer.orders.map((order, index) => {
                  const total = order.items.reduce(
                    (sum, i) => sum + i.unitPriceCents * i.quantity, 0
                  );
                  return (
                    <div key={order.id} className="space-y-4">
                      {index > 0 && <Separator className="border-gray-100" />}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-sm font-bold text-char hover:text-ember hover:underline transition-colors block"
                          >
                            {order.items[0]?.product.name}
                            {order.items.length > 1 && ` +${order.items.length - 1} more`}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-ash font-medium">
                            <span>ID: {order.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-char font-semibold">${(total / 100).toFixed(2)}</span>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center border rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${statusColor[order.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Addresses & Subscriptions */}
        <div className="space-y-6">
          {/* Addresses Card */}
          {customer.addresses.length > 0 && (
            <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ash mb-4 flex items-center gap-1.5">
                <MapPin size={14} /> Registered Addresses
              </p>
              <div className="space-y-3.5">
                {customer.addresses.map((addr, idx) => (
                  <div key={addr.id} className="space-y-2">
                    {idx > 0 && <Separator className="border-gray-100" />}
                    <p className="text-xs font-semibold text-char leading-relaxed">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""},<br />
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Subscriptions Card */}
          {customer.subscriptions.length > 0 && (
            <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ash mb-4 flex items-center gap-1.5">
                <CalendarDays size={14} /> Subscriptions
              </p>
              <div className="space-y-3">
                {customer.subscriptions.map((sub, idx) => (
                  <div key={sub.id} className="space-y-3">
                    {idx > 0 && <Separator className="border-gray-100" />}
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-char font-bold">{sub.product.name}</span>
                      <Badge
                        variant="outline"
                        className={`rounded-lg font-semibold px-2 py-0.5 border ${
                          sub.status === "active" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}