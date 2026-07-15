"use client";
import { useState } from "react";
import { Users, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { submitLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import type { EquipmentCartItem } from "@/lib/equipment-cart-store";

export default function VolumeOrderCTA({
  items,
}: {
  items: EquipmentCartItem[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    quantity: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build cart summary for the lead message
  const cartSummary = items
    .map((i) => `${i.name} × ${i.quantity} ($${(i.priceCents / 100).toFixed(0)} each)`)
    .join(", ");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const message = `Volume order enquiry.

Current cart: ${cartSummary}

Requested quantity: ${form.quantity} total units
Additional notes: ${form.message}

Current cart value: $${(items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0) / 100).toFixed(0)}`;

      await submitLead({
        name: form.name,
        email: form.email,
        company: form.company,
        phone: form.phone,
        message,
        interest: "custom",
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* CTA banner */}
      <div
        className="border border-dashed border-graphite/30 rounded-lg p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-ember/40 hover:bg-steam/30 transition-all"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-steam flex items-center justify-center text-ash flex-shrink-0">
            <Users size={15} />
          </div>
          <div>
            <p className="text-sm font-medium text-char">
              Ordering 3+ machines or multiple locations?
            </p>
            <p className="text-xs text-ash">
              Request volume pricing — we'll build a custom quote with your
              cart.
            </p>
          </div>
        </div>
        <span className="text-xs text-ember font-medium flex-shrink-0">
          Get quote →
        </span>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[520px] z-50 max-h-[90vh] overflow-y-auto"
            >
              <Card className="p-6 bg-steam">
                <div className="flex items-center justify-between mb-5 bg-steam">
                  <div>
                    <h2 className="font-display font-semibold text-lg text-char">
                      Volume order enquiry
                    </h2>
                    <p className="text-xs text-ash mt-0.5">
                      We'll send a custom quote within 1 business day
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-ash hover:text-char"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Cart summary */}
                <div className="bg-steam/60 rounded-lg px-4 py-3 mb-5">
                  <p className="text-xs uppercase tracking-wide text-ash mb-2">
                    Your current cart (included in quote request)
                  </p>
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm py-1"
                    >
                      <span className="text-char">
                        {item.name}{" "}
                        <span className="text-ash">× {item.quantity}</span>
                      </span>
                      <span className="text-ash">
                        ${(item.priceCents / 100).toFixed(0)} ea.
                      </span>
                    </div>
                  ))}
                </div>

                {success ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-3">
                      <CheckCircle2 size={22} />
                    </div>
                    <p className="font-medium text-char mb-1">
                      Quote request sent
                    </p>
                    <p className="text-ash text-sm">
                      We'll reply with custom pricing within 1 business day.
                    </p>
                    <button
                      onClick={() => setOpen(false)}
                      className="mt-4 text-sm text-ember font-medium"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-char">
                          Your name
                        </label>
                        <Input
                          required
                          placeholder="Marcus Chen"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-char">
                          Email
                        </label>
                        <Input
                          required
                          type="email"
                          placeholder="you@café.com"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-char">
                          Company / café
                        </label>
                        <Input
                          placeholder="Eleven Coffee Group"
                          value={form.company}
                          onChange={(e) =>
                            setForm({ ...form, company: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-char">
                          Total units needed
                        </label>
                        <Input
                          required
                          type="number"
                          min="3"
                          placeholder="e.g. 10"
                          value={form.quantity}
                          onChange={(e) =>
                            setForm({ ...form, quantity: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-char">
                        Additional notes{" "}
                        <span className="text-ash font-normal">
                          (locations, timeline, customisations)
                        </span>
                      </label>
                      <Textarea
                        placeholder="We have 4 locations opening in Q3 and need..."
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        rows={3}
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                        <AlertCircle size={13} /> {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-ember hover:bg-ember-dark text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={14} className="mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Request volume quote"
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}