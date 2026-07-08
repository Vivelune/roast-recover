"use client";
import { useEquipmentCart } from "@/lib/equipment-cart-store";
import { useState } from "react";
import { Wrench, Check } from "lucide-react";
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
      className="bg-ember hover:bg-ember-dark text-white w-full"
    >
      {added ? (
        <><Check size={15} className="mr-2" />Added to order</>
      ) : (
        <><Wrench size={15} className="mr-2" />Add to equipment order</>
      )}
    </Button>
  );
}