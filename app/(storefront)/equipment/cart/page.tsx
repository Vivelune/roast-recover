"use client";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, Minus, Plus, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEquipmentCart } from "@/lib/equipment-cart-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function EquipmentCartPage() {
  const { items, removeItem, updateQuantity } = useEquipmentCart();

  const totalDeposit = items.reduce(
    (sum, i) =>
      sum + Math.round((i.priceCents * i.depositPercent) / 100) * i.quantity,
    0
  );
  const totalValue = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-8 py-28 text-center">
        <div className="w-14 h-14 rounded-full bg-steam flex items-center justify-center text-ash mx-auto mb-5">
          <Wrench size={22} strokeWidth={1.5} />
        </div>
        <p className="font-display font-semibold text-lg text-char mb-1">
          No equipment in your order yet
        </p>
        <p className="text-ash text-sm mb-6">
          Browse equipment to start building your order.
        </p>
        <Button asChild className="bg-ember hover:bg-ember-dark">
          <Link href="/equipment">Browse equipment</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-16">
      <h1 className="font-display font-semibold text-2xl text-char mb-2">
        Your equipment order
      </h1>
      <p className="text-ash text-sm mb-8">
        You'll pay a combined deposit today. Each machine's balance is
        invoiced separately once it's ready to ship.
      </p>

      <Card className="overflow-hidden p-0">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const deposit = Math.round(
              (item.priceCents * item.depositPercent) / 100
            );
            return (
              <motion.div
                key={item.productId}
                initial={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="relative w-14 h-14 rounded-md bg-steam flex-shrink-0 overflow-hidden">
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

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-char truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-ash">
                      ${(deposit / 100).toFixed(2)} deposit each ·{" "}
                      {item.leadTimeDays ?? "—"}-day lead time
                    </p>
                  </div>

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

                  <p className="text-sm font-medium text-char w-20 text-right">
                    ${((deposit * item.quantity) / 100).toFixed(2)}
                  </p>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-ash hover:text-red-500 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <Separator />
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div className="px-5 py-4 space-y-1.5">
          <div className="flex justify-between text-sm text-ash">
            <span>Total equipment value</span>
            <span>${(totalValue / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-char">
            <span>Deposit due today</span>
            <span>${(totalDeposit / 100).toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Button
        asChild
        className="w-full bg-ember hover:bg-ember-dark mt-5 h-12 text-sm font-medium"
      >
        <Link
          href="/equipment/checkout"
          className="flex items-center justify-center gap-2"
        >
          Continue to checkout <ArrowRight size={15} />
        </Link>
      </Button>

      <p className="text-center text-xs text-ash mt-3">
        Packaging order?{" "}
        <Link href="/cart" className="text-ember underline">
          View packaging cart
        </Link>
      </p>
    </div>
  );
}