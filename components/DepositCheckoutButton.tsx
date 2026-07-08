"use client";
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { createEquipmentDepositCheckout } from "@/app/actions/equipment-checkout";

export default function DepositCheckoutButton({
  productId,
  addressId,
}: {
  productId: string;
  addressId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { checkoutUrl } = await createEquipmentDepositCheckout(productId, addressId);
      if (checkoutUrl) window.location.href = checkoutUrl;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-ember hover:bg-ember-dark disabled:opacity-60 text-white px-6 py-3.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
    >
      {loading ? <><Loader2 size={15} className="animate-spin" /> Redirecting...</> : <>Pay deposit &amp; order <ArrowRight size={15} /></>}
    </button>
  );
}