import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Package, ClipboardList, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getReorderInsights } from "@/lib/reorder";
import ReorderWidget from "@/components/ReorderWidget";
import { getOrCreateOnboarding } from "@/app/actions/onboarding";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import ActivityFeed from "@/components/ActivityFeed";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [orders, equipment, subscriptions, reorderInsights, onboarding,activityFeed,] = await Promise.all([
    
    
    prisma.order.findMany({
      where: {
        userId: user.id,
        OR: [
          // Show all non-pending orders
          {
            status: {
              notIn: ["PENDING", "PENDING_DEPOSIT"],
            },
          },
          // Show PENDING_DEPOSIT only if deposit was actually paid
          {
            status: "PENDING_DEPOSIT",
            depositPaidAt: { not: null },
          },
        ],
      },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.equipmentRegistryItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    }),
    prisma.subscription.findMany({
      where: { userId: user.id, status: "active" },
      include: { product: true },
    }),
    getReorderInsights(user.id),
    getOrCreateOnboarding(),

    prisma.activityEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  const stats = [
    { label: "Total orders", value: orders.length, icon: ClipboardList, href: "/account/orders" },
    { label: "Equipment owned", value: equipment.length, icon: Package, href: "/account/equipment" },
    { label: "Active subscriptions", value: subscriptions.length, icon: RefreshCw, href: "/account/subscriptions" },
  ];
  const defaultAddress = user.addresses?.[0] ?? null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {!onboarding.completedAt && (
        <OnboardingChecklist progress={onboarding} />
      )}
      
      {/* Header Info */}
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight mb-1">
          Welcome back
          {user.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-ash text-xs sm:text-sm">{user.email}</p>
      </div>

      {/* Stats - Responsive Grid (1 column on mobile, 3 on tablet/desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="group block">
            <Card className="p-5 border-gray-150 group-hover:border-ember/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] active:scale-[0.99] transition-all duration-200 rounded-xl h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-steam/40 rounded-lg text-ash group-hover:text-ember group-hover:bg-steam/80 transition-colors">
                  <Icon size={18} />
                </div>
                <ArrowRight size={14} className="text-ash/40 group-hover:text-ember group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
                  {value}
                </p>
                <p className="text-xs text-ash mt-1 font-medium">{label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <ReorderWidget
  insights={reorderInsights}
  defaultAddressId={defaultAddress?.id ?? null}
/>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-char">Recent orders</p>
          <Link href="/account/orders" className="text-xs text-ember">
            View all →
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-ash">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <Card className="px-4 py-3 flex items-center justify-between hover:border-ember/30 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-char">
                      {order.items[0]?.product.name}
                      {order.items.length > 1 &&
                        ` +${order.items.length - 1} more`}
                    </p>
                    <p className="text-xs text-ash">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-ash bg-steam px-2 py-1 rounded-md">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>


      <div className="mt-8">
  <p className="text-sm font-medium text-char mb-4">Recent activity</p>
  <ActivityFeed entries={activityFeed} />
</div>

    </div>
  );
}