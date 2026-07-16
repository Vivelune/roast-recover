"use client";

import { useState } from "react";
import { declareExistingEquipment } from "@/app/actions/onboarding";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

type EquipmentEntry = { name: string; brand: string; installYear: string };

export default function DeclareEquipmentPage() {
  const router = useRouter();
  const [items, setItems] = useState<EquipmentEntry[]>([
    { name: "", brand: "", installYear: "" },
  ]);
  const [saving, setSaving] = useState(false);

  function addItem() {
    setItems([...items, { name: "", brand: "", installYear: "" }]);
  }

  function updateItem(i: number, field: keyof EquipmentEntry, value: string) {
    setItems(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = items.filter((i) => i.name.trim());
    if (!valid.length) return;
    setSaving(true);
    try {
      await declareExistingEquipment(valid);
      router.push("/account/equipment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Title block */}
      <div>
        <h1 className="font-display font-semibold text-2xl text-char tracking-tight">
          Declare Existing Machinery
        </h1>
        <p className="text-ash text-sm mt-1">
          Add assets you already own. We will map warranty, maintenance schedules, and active service profiles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          {items.map((item, i) => (
            <Card key={i} className="p-5 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white space-y-4 relative">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-char">Machine Type</Label>
                  <Input
                    required
                    placeholder="e.g. Espresso Machine"
                    value={item.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-char">Brand / Model</Label>
                  <Input
                    placeholder="e.g. La Marzocco Linea"
                    value={item.brand}
                    onChange={(e) => updateItem(i, "brand", e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-char">Year Installed</Label>
                  <Input
                    placeholder="e.g. 2024"
                    value={item.installYear}
                    onChange={(e) => updateItem(i, "installYear", e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
                  />
                </div>
              </div>

              {items.length > 1 && (
                <div className="flex justify-end border-t border-gray-50 pt-3">
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ash hover:text-red-500 transition-colors px-2 py-1 rounded-md hover:bg-red-50/50"
                  >
                    <Trash2 size={13} /> Remove Unit
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Add item control */}
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B5481F] hover:text-[#9E3E1A] transition-colors"
        >
          <Plus size={15} /> Add another machine
        </button>

        {/* Submit action panel */}
        <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#B5481F] hover:bg-[#9E3E1A] text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs transition-colors"
          >
            {saving ? "Registering machinery..." : "Save Equipment"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/account/equipment")}
            className="rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-wider text-ash hover:text-char"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}