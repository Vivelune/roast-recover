"use client";
import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { useEquipmentCart } from "@/lib/equipment-cart-store";

export default function StoreHydration() {
  useEffect(() => {
    // Manually rehydrate both stores after client mount
    // This prevents SSR mismatch (server renders empty cart,
    // client reads localStorage and updates — no flash)
    useCart.persist.rehydrate();
    useEquipmentCart.persist.rehydrate();
  }, []);

  return null; // renders nothing, just triggers hydration
}