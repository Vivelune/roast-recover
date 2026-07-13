"use client";
import { createSubscriptionCheckout } from "@/app/actions/subscriptions";
import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscribeButton({
  productId,
  intervalDays = 30,
}: {
  productId: string;
  intervalDays?: number;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { checkoutUrl } = await createSubscriptionCheckout(
        productId,
        intervalDays
      );
      if (checkoutUrl) window.location.href = checkoutUrl;
    } catch (e: any) {
      alert(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="outline"
      className="w-full border-ember text-ember hover:bg-ember hover:text-white transition-colors"
    >
      {loading ? (
        <><Loader2 size={15} className="mr-2 animate-spin" />Setting up...</>
      ) : (
        <><RefreshCw size={15} className="mr-2" />Auto-reorder every {intervalDays} days</>
      )}
    </Button>
  );
}