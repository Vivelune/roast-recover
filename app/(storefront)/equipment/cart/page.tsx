"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, Minus, Plus, Wrench, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEquipmentCart } from "@/lib/equipment-cart-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import VolumeOrderCTA from "@/components/VolumeOrderCTA";

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
  const remainingBalance = totalValue - totalDeposit;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 sm:py-32 text-center">
        <div className="w-16 h-16 rounded-2xl bg-steam/60 border border-gray-200/20 flex items-center justify-center text-char mx-auto mb-6">
          <Wrench size={24} strokeWidth={1.5} />
        </div>
        <h2 className="font-display font-semibold text-xl text-char mb-2">
          Your equipment cart is empty
        </h2>
        <p className="text-ash text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          Browse our high-quality equipment listings and reserve machines for your café setup.
        </p>
        <Button asChild size="lg" className="bg-char hover:bg-char/90 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl">
          <Link href="/equipment">Browse equipment</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
          Your equipment order
        </h1>
        <p className="text-ash text-sm leading-relaxed max-w-xl">
          Secure production space with a standard deposit today. Remaining balances are calculated and invoiced individually once the machines clear final inspection and prepare for shipment.
        </p>
      </div>

      {/* Cart Items Card */}
      <Card className="overflow-hidden border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl">
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 px-5 py-5">
                  
                  {/* Thumbnail & Product Details Container */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-16 h-16 rounded-xl bg-steam shrink-0 overflow-hidden border border-gray-100">
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

                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-char truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-ash">
                        ${(deposit / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} deposit per unit ·{" "}
                        <span className="font-medium text-char">{item.leadTimeDays ?? "—"} day lead time</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity Actions & Price Breakdowns Container */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-150 rounded-xl bg-[#FBFBFA] h-9">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="p-2 text-ash hover:text-char transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-xs font-bold text-char w-8 text-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="p-2 text-ash hover:text-char transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Deposit Calculation */}
                    <div className="text-right min-w-[5.5rem]">
                      <p className="text-xs text-ash">Deposit Subtotal</p>
                      <p className="text-sm font-bold text-char">
                        ${((deposit * item.quantity) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-ash hover:text-red-500 hover:bg-red-50/50 p-2 rounded-lg transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                </div>
                <Separator className="border-gray-100" />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Pricing Summary Block */}
        <div className="bg-[#FBFBFA] px-5 py-6 space-y-4">
          <div className="flex justify-between items-center text-xs sm:text-sm text-ash font-medium">
            <span>Total Equipment Value</span>
            <span>${(totalValue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex justify-between items-center text-xs sm:text-sm text-ash font-medium border-b border-gray-200/50 pb-4">
            <span>Remaining Sourcing Balances</span>
            <span>${(remainingBalance / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-char">Deposit Due Today</p>
              <p className="text-[10px] text-ash mt-0.5">Locks in your pricing & production queue</p>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-char">
              ${(totalDeposit / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>

      {/* Checkout and Navigation Actions */}
      <div className="space-y-4">
        <Button
          asChild
          className="w-full bg-char hover:bg-char/90 text-white h-13 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Link
            href="/equipment/checkout"
            className="flex items-center justify-center gap-2"
          >
            Continue to checkout <ArrowRight size={14} />
          </Link>
        </Button>

        <VolumeOrderCTA items={items} /> 

        <div className="flex justify-center items-center gap-1.5 text-xs text-ash mt-2">
          <ShoppingBag size={13} />
          <span>Ordering custom prints or bags?</span>
          <Link href="/cart" className="text-ember font-bold hover:underline">
            View packaging cart
          </Link>
        </div>
      </div>
    </div>
  );
}