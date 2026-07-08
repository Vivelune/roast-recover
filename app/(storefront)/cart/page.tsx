"use client";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();
  const total = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-8 py-28 text-center">
        <div className="w-14 h-14 rounded-full bg-steam flex items-center justify-center text-ash mx-auto mb-5">
          <ShoppingBag size={22} strokeWidth={1.5} />
        </div>
        <p className="font-display font-semibold text-lg text-char mb-1">
          Your cart is empty
        </p>
        <p className="text-ash text-sm mb-6">
          Browse packaging to get started.
        </p>
        <Button asChild className="bg-ember hover:bg-ember-dark">
          <Link href="/packaging">Browse packaging</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-16">
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        Your cart
      </h1>

      <Card className="overflow-hidden p-0">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Thumbnail */}
                <div className="relative w-14 h-14 rounded-md bg-steam shrink-0 overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-steam" />
                  )}
                </div>

                {/* Name + price */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-char truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-ash">
                    ${(item.priceCents / 100).toFixed(2)} each
                  </p>
                </div>

                {/* Qty stepper */}
                <div className="flex items-center border border-border rounded-md">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="p-1.5 text-ash hover:text-char transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-sm text-char w-7 text-center select-none">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="p-1.5 text-ash hover:text-char transition-colors"
                    aria-label="Increase"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Line total */}
                <p className="text-sm font-medium text-char w-16 text-right">
                  ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                </p>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-ash hover:text-red-500 transition-colors ml-1"
                  aria-label="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <Separator />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Total row */}
        <div className="flex justify-between items-center px-5 py-4">
          <p className="text-sm text-ash">Total</p>
          <p className="font-semibold text-char text-lg">
            ${(total / 100).toFixed(2)}
          </p>
        </div>
      </Card>

      <Button
        asChild
        className="w-full bg-ember hover:bg-ember-dark mt-5 h-12 text-sm font-medium"
      >
        <Link
          href="/checkout"
          className="flex items-center justify-center gap-2"
        >
          Continue to checkout <ArrowRight size={15} />
        </Link>
      </Button>

      <p className="text-center text-xs text-ash mt-3">
        Equipment orders?{" "}
        <Link href="/equipment/cart" className="text-ember underline">
          View equipment cart
        </Link>
      </p>
    </div>
  );
}