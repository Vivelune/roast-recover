"use client";
import { cancelSubscription } from "@/app/actions/subscriptions";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CancelSubscriptionButton({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleCancel() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setLoading(true);
    try {
      await cancelSubscription(subscriptionId);
    } finally {
      setLoading(false);
      setConfirmed(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCancel}
      disabled={loading}
      className={confirmed ? "text-red-600 hover:text-red-700" : "text-ash hover:text-char"}
    >
      {loading ? "Cancelling..." : confirmed ? "Confirm cancel?" : "Cancel"}
    </Button>
  );
}