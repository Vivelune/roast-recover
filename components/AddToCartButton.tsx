"use client";
import { useCart } from "@/lib/cart-store";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddToCartButton({
  product,
}: {
  product: {
    productId: string;
    slug: string;
    name: string;
    priceCents: number;
    image?: string;
  };
}) {
  const { addItem } = useCart();
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
        <>
          <Check size={15} className="mr-2" /> Added to cart
        </>
      ) : (
        <>
          <ShoppingBag size={15} className="mr-2" /> Add to cart
        </>
      )}
    </Button>
  );
}