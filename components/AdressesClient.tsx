"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Trash2, Plus } from "lucide-react";
import { createAddress, deleteAddress } from "@/app/actions/addresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "./ui/label";

type Address = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
};

export default function AddressesClient({
  addresses: initial,
}: {
  addresses: Address[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    line1: "", line2: "", city: "", state: "", zip: "" ,country: "US",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createAddress(form);
      setForm({ line1: "", line2: "", city: "", state: "", zip: "", country: "US", });
      setShowForm(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteAddress(id);
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char mb-1">
            Addresses
          </h1>
          <p className="text-ash text-sm">
            Saved shipping addresses for your orders.
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-ember hover:bg-ember-dark"
          >
            <Plus size={15} className="mr-1.5" /> Add address
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-5 mb-6">
          <p className="text-sm font-medium text-char mb-4">New address</p>
          <form onSubmit={handleSave} className="space-y-3">
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
  <Input required placeholder="City" value={form.city}
    onChange={(e) => setForm({ ...form, city: e.target.value })} />
  <Input required placeholder="State / Province" value={form.state}
    onChange={(e) => setForm({ ...form, state: e.target.value })} />
  <Input required placeholder="ZIP / Postal code" value={form.zip}
    onChange={(e) => setForm({ ...form, zip: e.target.value })} />
</div>

{/* Country — default US, allow change */}
<div className="space-y-1.5">
  <Label htmlFor="country">Country</Label>
  <select
    id="country"
    value={form.country}
    onChange={(e) => setForm({ ...form, country: e.target.value })}
    className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ember"
  >
    <option value="US">United States</option>
    <option value="GB">United Kingdom</option>
    <option value="CA">Canada</option>
    <option value="AU">Australia</option>
    <option value="SG">Singapore</option>
    <option value="AE">United Arab Emirates</option>
    <option value="PH">Philippines</option>
    <option value="ID">Indonesia</option>
    <option value="VN">Vietnam</option>
    <option value="TH">Thailand</option>
    <option value="MY">Malaysia</option>
    <option value="OTHER">Other</option>
  </select>
</div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save address"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {initial.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-steam flex items-center justify-center text-ash mx-auto mb-4">
            <MapPin size={20} />
          </div>
          <p className="text-char font-medium mb-1">No addresses saved</p>
          <p className="text-ash text-sm">
            Add an address to speed up checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {initial.map((addr) => (
            <Card key={addr.id} className="px-5 py-4 flex items-center justify-between">
              <p className="text-sm text-char leading-relaxed">
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}
                <br />
                {addr.city}, {addr.state} {addr.zip}
              </p>
              <button
                onClick={() => handleDelete(addr.id)}
                disabled={deleting === addr.id}
                className="text-ash hover:text-red-500 transition-colors ml-4 shrink-0"
                aria-label="Delete address"
              >
                {deleting === addr.id ? (
                  <span className="text-xs">...</span>
                ) : (
                  <Trash2 size={15} />
                )}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}