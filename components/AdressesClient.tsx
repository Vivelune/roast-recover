"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Trash2, Plus } from "lucide-react";
import { createAddress, deleteAddress } from "@/app/actions/addresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Address = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export default function AddressesClient({
  addresses: initial,
}: {
  addresses: Address[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    line1: "", line2: "", city: "", state: "", zip: "", country: "United States",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createAddress(form);
      setForm({ line1: "", line2: "", city: "", state: "", zip: "", country: "United States" });
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
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char tracking-tight">
            Addresses
          </h1>
          <p className="text-ash text-sm mt-0.5">
            Manage your saved shipping coordinates for faster checkout processing.
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#B5481F] hover:bg-[#9E3E1A] text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs self-start sm:self-auto shrink-0 transition-colors"
          >
            <Plus size={14} className="mr-1.5" /> Add address
          </Button>
        )}
      </div>

      {/* Address registration form */}
      {showForm && (
        <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
          <p className="text-xs font-bold uppercase tracking-wider text-[#B5481F] mb-4">New Address Profile</p>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-char">Street Address</Label>
              <Input
                required
                placeholder="Address line 1"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-char">Suite, Apartment, Unit <span className="text-ash font-normal text-[10px] lowercase italic">(optional)</span></Label>
              <Input
                placeholder="Address line 2 (optional)"
                value={form.line2 || ""}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-char">City</Label>
                <Input 
                  required 
                  placeholder="City" 
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })} 
                  className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-char">State / Region</Label>
                <Input 
                  required 
                  placeholder="State / Province" 
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })} 
                  className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-char">Postal Code</Label>
                <Input 
                  required 
                  placeholder="ZIP / Postal code" 
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })} 
                  className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-xs font-bold uppercase tracking-wider text-char">Country</Label>
              <Input
                id="country"
                required
                placeholder="e.g. United States, United Arab Emirates, United Kingdom"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-[#B5481F] hover:bg-[#9E3E1A] text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs transition-colors"
              >
                {saving ? "Saving..." : "Save address"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-wider text-ash hover:text-char"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Addresses rendering lists */}
      {initial.length === 0 && !showForm ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-2xl bg-white">
          <div className="w-12 h-12 rounded-2xl bg-steam flex items-center justify-center text-ash mx-auto mb-4 border border-gray-100">
            <MapPin size={20} className="text-[#B5481F]" />
          </div>
          <p className="text-char font-semibold">No addresses saved yet</p>
          <p className="text-ash text-xs mt-1 mb-6 max-w-xs mx-auto">
            Provide standard distribution vectors ahead of time to complete checkout loops cleanly.
          </p>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-[#B5481F] hover:bg-[#9E3E1A] text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs transition-colors"
          >
            Add an address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {initial.map((addr) => (
            <Card key={addr.id} className="p-5 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white flex items-start justify-between gap-4">
              <div className="space-y-1 text-char text-sm leading-relaxed font-medium">
                <p className="font-bold text-char">{addr.line1}</p>
                {addr.line2 && <p className="text-ash text-xs">{addr.line2}</p>}
                <p className="text-ash text-xs font-semibold">
                  {addr.city}, {addr.state} {addr.zip}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#B5481F] pt-1">{addr.country}</p>
              </div>
              <button
                onClick={() => {
                  if(confirm("Remove this address profile permanently?")) {
                    handleDelete(addr.id);
                  }
                }}
                disabled={deleting === addr.id}
                className="text-ash hover:text-red-500 transition-colors h-8 w-8 inline-flex items-center justify-center border border-transparent hover:border-red-100 hover:bg-red-50 rounded-lg shrink-0 select-none"
                aria-label="Delete address"
              >
                {deleting === addr.id ? (
                  <span className="text-[10px] font-bold">...</span>
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}