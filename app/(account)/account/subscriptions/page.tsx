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
    <div>
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 mb-6 text-sm">
          <CheckCircle2 size={16} />
          Auto-reorder is now active. You'll receive a confirmation email shortly.
        </div>
      )}

      <h1 className="font-display font-semibold text-2xl text-char mb-2">
        Subscriptions
      </h1>
      <p className="text-ash text-sm mb-8">
        Auto-reorder schedules for your packaging supplies.
      </p>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-steam flex items-center justify-center text-ash mx-auto mb-4">
            <RefreshCw size={20} />
          </div>
          <p className="text-char font-medium mb-1">No active subscriptions</p>
          <p className="text-ash text-sm mb-5">
            Set up auto-reorder on any packaging product.
          </p>
          <Button asChild className="bg-ember hover:bg-ember-dark">
            <Link href="/packaging">Browse packaging</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-char mb-1">
                    {sub.product.name}
                  </p>
                  <p className="text-xs text-ash">
                    Every {sub.intervalDays} days ·{" "}
                    ${(sub.product.priceCents / 100).toFixed(2)}/order
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      sub.status === "active"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : sub.status === "past_due"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {sub.status.replace("_", " ")}
                  </Badge>
                  {sub.status === "active" && (
                    <CancelSubscriptionButton subscriptionId={sub.id} />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}