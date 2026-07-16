import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CancelSubscriptionButton from "@/components/CancelSubscriptionButton";

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { success } = await searchParams;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-2.5 bg-green-50/60 border border-green-200/80 text-green-800 rounded-2xl px-4 py-3.5 text-xs font-medium">
          <CheckCircle2 size={15} className="text-green-600 shrink-0" />
          Auto-reorder is now active. You&apos;ll receive a confirmation email shortly.
        </div>
      )}

      {/* Header section */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="font-display font-semibold text-2xl text-char tracking-tight">
          Subscriptions
        </h1>
        <p className="text-ash text-sm mt-0.5">
          Auto-reorder schedules for your packaging supplies.
        </p>
      </div>

      {/* Empty State */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-2xl bg-white">
          <div className="w-12 h-12 rounded-2xl bg-steam flex items-center justify-center text-ash mx-auto mb-4 border border-gray-100">
            <RefreshCw size={20} className="text-[#B5481F]" />
          </div>
          <p className="text-char font-semibold">No active subscriptions</p>
          <p className="text-ash text-xs mt-1 mb-6 max-w-xs mx-auto">
            Set up automatic re-ordering on any of our premium packaging products to keep your workspace supplied.
          </p>
          <Button asChild className="bg-[#B5481F] hover:bg-[#9E3E1A] text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs transition-colors">
            <Link href="/packaging">Browse packaging</Link>
          </Button>
        </div>
      ) : (
        /* Subscriptions List */
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="p-5 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-bold text-char text-sm">
                  {sub.product.name}
                </p>
                <p className="text-ash text-xs font-semibold">
                  Delivered every {sub.intervalDays} days · ${(sub.product.priceCents / 100).toFixed(2)} / order
                </p>
              </div>
              
              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <Badge
                  variant="outline"
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    sub.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : sub.status === "past_due"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {sub.status.replace("_", " ")}
                </Badge>
                {sub.status === "active" && (
                  <CancelSubscriptionButton subscriptionId={sub.id} />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}