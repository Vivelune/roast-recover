"use client";

import { useEquipmentCart } from "@/lib/equipment-cart-store";
import { createEquipmentOrderCheckout } from "@/app/actions/equipment-checkout";
import { createAddress } from "@/app/actions/addresses";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Loader2, ShieldCheck,
  AlertCircle, ArrowLeft, Lock, Plus, Check
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CheckoutSteps from "./CheckoutSteps";
import { Label } from "./ui/label";

type Address = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export default function EquipmentCheckoutClient({
  addresses,
}: {
  addresses: Address[];
}) {
  const { items } = useEquipmentCart();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(addresses[0]?.id ?? "");
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDeposit = items.reduce(
    (sum, i) =>
      sum + Math.round((i.priceCents * i.depositPercent) / 100) * i.quantity,
    0
  );

  const totalValue = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );

  const step = !selectedId || showForm ? 2 : 3;

  async function handlePay() {
    if (!selectedId) return;
    setError(null);
    setLoading(true);
    try {
      const { checkoutUrl } = await createEquipmentOrderCheckout(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        selectedId
      );
      if (checkoutUrl) window.location.href = checkoutUrl;
      else throw new Error();
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-ash mb-4">No equipment in your order.</p>
        <Link href="/equipment" className="text-ember font-bold text-sm hover:underline">
          Browse equipment →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      {/* Back Button */}
      <Link
        href="/equipment/cart"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ash hover:text-char transition-colors"
      >
        <ArrowLeft size={13} /> Back to cart
      </Link>

      {/* Header & Progress Indicator */}
      <div className="space-y-6">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
          Equipment Checkout
        </h1>
        <CheckoutSteps current={step} />
      </div>

      {/* Responsive Stacking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-14 items-start">
        
        {/* Main Content: Shipping Address Selector */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ash flex items-center gap-2 tracking-widest">
              <MapPin size={14} className="text-char" /> 1. Shipping Address
            </h2>

            {!showForm && addresses.length > 0 && (
              <div className="space-y-4">
                <RadioGroup
                  value={selectedId}
                  onValueChange={setSelectedId}
                  className="grid grid-cols-1 gap-3"
                >
                  {addresses.map((addr) => {
                    const isSelected = selectedId === addr.id;
                    return (
                      <label
                        key={addr.id}
                        htmlFor={`eq-${addr.id}`}
                        className={`relative flex items-start gap-4 p-5 border rounded-2xl cursor-pointer select-none transition-all ${
                          isSelected
                            ? "border-char bg-[#FBFBFA] shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                            : "border-gray-150 hover:border-gray-200 bg-white"
                        }`}
                      >
                        <RadioGroupItem
                          value={addr.id}
                          id={`eq-${addr.id}`}
                          className="mt-1 accent-char"
                        />
                        <div className="space-y-1">
                          <span className="block text-sm font-semibold text-char leading-tight">
                            {addr.line1}
                          </span>
                          {addr.line2 && (
                            <span className="block text-xs text-ash leading-none">
                              {addr.line2}
                            </span>
                          )}
                          <span className="block text-xs text-ash leading-relaxed">
                            {addr.city}, {addr.state} {addr.zip}
                          </span>
                          <span className="block text-[10px] font-bold text-ash uppercase tracking-wider pt-1">
                            {addr.country || "United States"}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>

                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ember hover:text-ember-dark transition-colors uppercase tracking-wider mt-1"
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
          </div>

          {error && (
            <div className="flex items-start gap-3 text-xs font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3.5">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Action Trigger Box */}
          <div className="space-y-3 pt-4 border-t border-gray-150">
            <Button
              onClick={handlePay}
              disabled={loading || !selectedId || showForm}
              className="w-full bg-char hover:bg-char/90 text-white disabled:opacity-50 h-13 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Redirecting to Stripe...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock size={13} /> Securely Pay ${(totalDeposit / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} Deposit
                </span>
              )}
            </Button>
            <p className="text-[11px] text-ash text-center leading-normal max-w-md mx-auto">
              Remaining sourcing and import balances are calculated and invoiced individually when each machine is fully staged for local transit.
            </p>
          </div>
        </div>

        {/* Sidebar Summary Panel */}
        <div className="lg:sticky lg:top-24 self-start">
          <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-[#FBFBFA] rounded-2xl space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ash tracking-widest border-b border-gray-200/60 pb-3">
              Order Summary
            </p>
            
            <div className="space-y-3.5 max-h-60 overflow-y-auto no-scrollbar">
              {items.map((item) => {
                const deposit = Math.round(
                  (item.priceCents * item.depositPercent) / 100
                );
                return (
                  <div key={item.productId} className="flex justify-between items-baseline gap-4 text-xs sm:text-sm">
                    <div className="min-w-0">
                      <p className="text-char font-semibold truncate leading-tight">{item.name}</p>
                      <p className="text-xs text-ash mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-char font-medium whitespace-nowrap">
                      ${((deposit * item.quantity) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>

            <Separator className="border-gray-200/60" />

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-ash">
                <span>Total Equipment Value</span>
                <span className="font-medium text-char">
                  ${(totalValue / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs text-ash pb-2 border-b border-gray-200/50">
                <span>Remaining Balances</span>
                <span className="font-medium text-char">
                  ${((totalValue - totalDeposit) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs font-bold text-char uppercase tracking-wider">Deposit Due Today</span>
                <span className="text-lg font-bold text-char">
                  ${(totalDeposit / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-ash font-medium border-t border-gray-200/60 pt-3">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>Checkout process encrypted by Stripe</span>
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
    country: "",
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
    <Card className="p-5 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-char tracking-widest">
          New Shipping Destination
        </p>
        
        <div className="space-y-3">
          <Input
            required
            placeholder="Address Line 1"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            className="rounded-xl border-gray-150 focus-visible:ring-char"
          />
          <Input
            placeholder="Address Line 2 (Optional)"
            value={form.line2}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
            className="rounded-xl border-gray-150 focus-visible:ring-char"
          />
          
          <div className="grid grid-cols-3 gap-3">
            <Input
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="rounded-xl border-gray-150 focus-visible:ring-char"
            />
            <Input
              required
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="rounded-xl border-gray-150 focus-visible:ring-char"
            />
            <Input
              required
              placeholder="ZIP"
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
              className="rounded-xl border-gray-150 focus-visible:ring-char"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <Label htmlFor="country" className="text-xs font-semibold text-char">
              Country
            </Label>
            <Input
              id="country"
              placeholder="e.g. United States, United Arab Emirates, United Kingdom"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="rounded-xl border-gray-150 focus-visible:ring-char"
            />
            <p className="text-[10px] text-ash">
              Leave blank to default to United States.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button
            type="submit"
            disabled={saving}
            className="bg-char hover:bg-char/90 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl"
          >
            {saving ? "Saving..." : "Save Address"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-xs font-bold uppercase tracking-wider hover:bg-steam px-4 py-2 rounded-xl text-ash"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}