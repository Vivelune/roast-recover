"use client";
import { useCart } from "@/lib/cart-store";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Loader2, ShieldCheck,
  AlertCircle, ArrowLeft, Lock, Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CheckoutSteps from "./CheckoutSteps";
import { createAddress } from "@/app/actions/addresses";
import { createCheckoutSession } from "@/app/actions/checkout";

type Address = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
};

export default function CheckoutClient({
  addresses,
}: {
  addresses: Address[];
}) {
  const { items, clear } = useCart();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(addresses[0]?.id ?? "");
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );
  const step = !selectedId || showForm ? 2 : 3;

  async function handlePay() {
    if (!selectedId) return;
    setError(null);
    setLoading(true);
    try {
      const { checkoutUrl } = await createCheckoutSession(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        selectedId
      );
      if (checkoutUrl) window.location.href = checkoutUrl;
      else throw new Error("No checkout URL returned");
    } catch (e: any) {
      const raw = e?.message ?? "";
  
      // Translate common errors into friendly messages
      const friendly = raw.includes("card")
        ? "Your card was declined. Try a different card or contact your bank."
        : raw.includes("unavailable") || raw.includes("not found")
        ? "One of your items is no longer available. Please refresh and try again."
        : raw.includes("address")
        ? "Please add a shipping address before checking out."
        : raw.includes("signed in") || raw.includes("Unauthorized")
        ? "Your session expired. Please sign in again."
        : raw.includes("Cart is empty")
        ? "Your cart is empty. Add items before checking out."
        : raw || "Something went wrong starting checkout. Please try again.";
  
      setError(friendly);
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-8 py-24 text-center">
        <p className="text-ash mb-4">Your cart is empty.</p>
        <Link href="/packaging" className="text-ember font-medium text-sm">
          Browse packaging →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-ash hover:text-char transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to cart
      </Link>

      <h1 className="font-display font-semibold text-2xl text-char mb-2">
        Checkout
      </h1>
      <CheckoutSteps current={step} />

      <div className="grid md:grid-cols-[1fr_340px] gap-10">
        {/* Left — address */}
        <div>
          <p className="text-xs uppercase tracking-wide text-ash mb-4 flex items-center gap-2">
            <MapPin size={13} /> Shipping address
          </p>

          {!showForm && addresses.length > 0 && (
            <div className="space-y-2.5">
              <RadioGroup
                value={selectedId}
                onValueChange={setSelectedId}
                className="space-y-2.5"
              >
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    htmlFor={addr.id}
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedId === addr.id
                        ? "border-ember bg-steam/40 ring-1 ring-ember/20"
                        : "border-border hover:border-ash/40"
                    }`}
                  >
                    <RadioGroupItem
                      value={addr.id}
                      id={addr.id}
                      className="mt-0.5"
                    />
                    <span className="text-sm text-char leading-relaxed">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}
                      <br />
                      {addr.city}, {addr.state} {addr.zip}
                    </span>
                  </label>
                ))}
              </RadioGroup>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 text-sm text-ember font-medium mt-1"
              >
                <Plus size={13} /> Add a new address
              </button>
            </div>
          )}

          {showForm && (
            <AddressForm
              onSaved={(id) => {
                setSelectedId(id);
                setShowForm(false);
                router.refresh();
              }}
              onCancel={
                addresses.length > 0 ? () => setShowForm(false) : undefined
              }
            />
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-4 py-3 mt-5">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={loading || !selectedId || showForm}
            className="w-full bg-ember text-white hover:bg-ember-dark disabled:opacity-50 h-12 text-sm font-medium mt-8"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin mr-2" />
                Redirecting to payment...
              </>
            ) : (
              <>
                <Lock size={14} className="mr-2" />
                Pay ${(total / 100).toFixed(2)} securely
              </>
            )}
          </Button>
          <p className="text-xs text-ash text-center mt-2">
            You'll complete payment on Stripe's secure checkout page.
          </p>
        </div>

        {/* Right — sticky summary */}
        <div className="md:sticky md:top-24 self-start">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-ash mb-4">
              Order summary
            </p>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-char">
                    {item.name}{" "}
                    <span className="text-ash">× {item.quantity}</span>
                  </span>
                  <span className="text-char">
                    ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-semibold text-char mb-5">
              <span>Total</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ash">
              <ShieldCheck size={13} className="text-ember" />
              Secure checkout powered by Stripe
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddressForm({
  onSaved,
  onCancel,
}: {
  onSaved: (id: string) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const addr = await createAddress(form);
      onSaved(addr.id);
    } catch {
      setError("Couldn't save address — check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          required
          placeholder="Address line 1"
          value={form.line1}
          onChange={(e) => setForm({ ...form, line1: e.target.value })}
        />
        <Input
          placeholder="Address line 2 (optional)"
          value={form.line2}
          onChange={(e) => setForm({ ...form, line2: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-3">
          <Input
            required
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <Input
            required
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <Input
            required
            placeholder="ZIP"
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2.5">
            <AlertCircle size={13} /> {error}
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save address"}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}