import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type EquipmentCartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  depositPercent: number;
  leadTimeDays: number | null;
  quantity: number;
  image?: string;
};

type EquipmentCartState = {
  items: EquipmentCartItem[];
  addItem: (item: Omit<EquipmentCartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useEquipmentCart = create<EquipmentCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, qty = 1) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: qty }] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: "rr-equipment-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);