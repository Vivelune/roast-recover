"use client";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { useEquipmentCart } from "@/lib/equipment-cart-store";

export default function CartClearer({
  type,
}: {
  type: "packaging" | "equipment";
}) {
  const clearPackaging = useCart((s) => s.clear);
  const clearEquipment = useEquipmentCart((s) => s.clear);

  useEffect(() => {
    if (type === "packaging") {
      clearPackaging();
    } else {
      clearEquipment();
    }
  }, []);

  return null;
}