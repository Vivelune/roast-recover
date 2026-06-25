"use client";
import { useCart } from "@/lib/cart";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/checkout";
import { createAddress } from "@/app/actions/addresses";

type Address = { id: string; line1: string; line2: string | null; city: string; state: string; zip: string };

export default function CheckoutClient({ addresses }: { addresses: Address[] }) {
  const { items } = useCart();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(addresses[0]?.id ?? "");
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [loading, setLoading] = useState(false);
  const total = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  async function handlePay() {
    if (!selectedId) return;
    setLoading(true);
    try {
      const { checkoutUrl } = await createCheckoutSession(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        selectedId
      );
      if (checkoutUrl) window.location.href = checkoutUrl;
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-8 py-24 text-center">
        <p className="text-ash">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-16">
      <h1 className="font-display font-semibold text-2xl text-char mb-10">Checkout</h1>

      {/* Order summary */}
      <div className="border border-gray-100 rounded-lg p-6 mb-8">
        <p className="text-xs uppercase tracking-wide text-ash mb-4">Order summary</p>
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between py-2 text-sm">
            <p className="text-char">{item.name} <span className="text-ash">× {item.quantity}</span></p>
            <p className="text-char">${((item.priceCents * item.quantity) / 100).toFixed(2)}</p>
          </div>
        ))}
        <div className="flex justify-between pt-4 mt-2 border-t border-gray-100 font-medium text-char">
          <p>Total</p>
          <p>${(total / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Address selection */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-wide text-ash mb-4 flex items-center gap-2">
          <MapPin size={14} /> Shipping address
        </p>

        {!showForm && addresses.length > 0 && (
          <div className="space-y-2">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedId === addr.id ? "border-ember bg-steam/40" : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedId === addr.id}
                  onChange={() => setSelectedId(addr.id)}
                  className="mt-1 accent-ember"
                />
                <span className="text-sm text-char">
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                  {addr.city}, {addr.state} {addr.zip}
                </span>
              </label>
            ))}
            <button onClick={() => setShowForm(true)} className="text-sm text-ember font-medium mt-2">
              + Add a new address
            </button>
          </div>
        )}

        {showForm && (
          <AddressForm
            onSaved={(id) => { setSelectedId(id); setShowForm(false); router.refresh(); }}
            onCancel={addresses.length > 0 ? () => setShowForm(false) : undefined}
          />
        )}
      </div>

      <button
        onClick={handlePay}
        disabled={loading || !selectedId}
        className="w-full bg-ember hover:bg-ember-dark disabled:opacity-50 text-white px-6 py-3.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 size={15} className="animate-spin" /> Redirecting...</> : `Pay $${(total / 100).toFixed(2)}`}
      </button>
    </div>
  );
}

function AddressForm({ onSaved, onCancel }: { onSaved: (id: string) => void; onCancel?: () => void }) {
  const [form, setForm] = useState({ line1: "", line2: "", city: "", state: "", zip: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const addr = await createAddress(form);
      onSaved(addr.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-gray-200 rounded-lg p-5">
      <input required placeholder="Address line 1" value={form.line1}
        onChange={(e) => setForm({ ...form, line1: e.target.value })}
        className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm" />
      <input placeholder="Address line 2 (optional)" value={form.line2}
        onChange={(e) => setForm({ ...form, line2: e.target.value })}
        className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm" />
      <div className="grid grid-cols-3 gap-3">
        <input required placeholder="City" value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm" />
        <input required placeholder="State" value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm" />
        <input required placeholder="ZIP" value={form.zip}
          onChange={(e) => setForm({ ...form, zip: e.target.value })}
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm" />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className="bg-char text-white text-sm px-4 py-2 rounded-md">
          {saving ? "Saving..." : "Save address"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-ash">Cancel</button>
        )}
      </div>
    </form>
  );
}