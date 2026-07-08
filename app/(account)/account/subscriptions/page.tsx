import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
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
            Set up auto-reorder on any packaging product after your first order.
          </p>
          <Button asChild className="bg-ember hover:bg-ember-dark">
            <Link href="/packaging">Browse packaging</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-char mb-1">
                  {sub.product.name}
                </p>
                <p className="text-xs text-ash">
                  Every {sub.intervalDays} days ·{" "}
                  ${(sub.product.priceCents / 100).toFixed(2)}/order
                </p>
              </div>
              <Badge
                className={
                  sub.status === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-600"
                }
                variant="outline"
              >
                {sub.status}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}