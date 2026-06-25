"use client";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import { Trash2, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem } = useCart();
  const total = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-8 py-24 text-center">
        <p className="text-ash mb-4">Your cart is empty.</p>
        <Link href="/packaging" className="text-ember font-medium text-sm">Browse packaging →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-16">
      <h1 className="font-display font-semibold text-2xl text-char mb-8">Your cart</h1>
      {items.map((item) => (
        <div key={item.productId} className="flex justify-between items-center py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-char">{item.name}</p>
            <p className="text-xs text-ash">Qty {item.quantity}</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-char">${((item.priceCents * item.quantity) / 100).toFixed(2)}</p>
            <button onClick={() => removeItem(item.productId)} className="text-ash hover:text-ember transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
      <div className="flex justify-between py-5 font-medium text-char">
        <p>Total</p>
        <p>${(total / 100).toFixed(2)}</p>
      </div>
      <Link
        href="/checkout"
        className="w-full bg-ember hover:bg-ember-dark text-white px-6 py-3.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        Continue to checkout <ArrowRight size={15} />
      </Link>
    </div>
  );
}