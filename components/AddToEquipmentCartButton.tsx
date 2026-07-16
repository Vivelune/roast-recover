"use client";
import { useEquipmentCart } from "@/lib/equipment-cart-store";
import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddToEquipmentCartButton({
  product,
}: {
  product: {
    productId: string;
    slug: string;
    name: string;
    priceCents: number;
    depositPercent: number;
    leadTimeDays: number | null;
    image?: string;
  };
}) {
  const { addItem } = useEquipmentCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Button
      onClick={handleClick}
      disabled={added}
      className={`w-full h-11 text-xs uppercase tracking-wider font-bold transition-all duration-200 rounded-xl shadow-sm ${
        added
          ? "bg-emerald-600 hover:bg-emerald-600 text-white"
          : "bg-ember hover:bg-ember-dark text-white"
      }`}
    >
      {added ? (
        <>
          <Check size={14} className="mr-1.5 stroke-[2.5]" />
          Added to Order
        </>
      ) : (
        <>
          <Plus size={14} className="mr-1.5 stroke-[2.5]" />
          Add to Equipment Order
        </>
      )}
    </Button>
  );
}