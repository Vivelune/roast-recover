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
    <div className="max-w-xl">
      <h1 className="font-display font-semibold text-2xl text-char mb-2">
        What equipment do you currently have?
      </h1>
      <p className="text-ash text-sm mb-8">
        Add machines you already own — even ones you didn't buy from us. This
        builds your equipment registry so we can track service history and
        warranty dates going forward.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {items.map((item, i) => (
          <Card key={i} className="p-4">
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="space-y-1.5 col-span-3 md:col-span-1">
                <Label className="text-xs">Machine type</Label>
                <Input
                  required
                  placeholder="e.g. Espresso machine"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Brand / model</Label>
                <Input
                  placeholder="e.g. La Marzocco"
                  value={item.brand}
                  onChange={(e) => updateItem(i, "brand", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Year installed</Label>
                <Input
                  placeholder="e.g. 2022"
                  value={item.installYear}
                  onChange={(e) => updateItem(i, "installYear", e.target.value)}
                />
              </div>
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-xs text-ash hover:text-red-500 transition-colors"
              >
                <Trash2 size={12} className="inline mr-1" /> Remove
              </button>
            )}
          </Card>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 text-sm text-ember font-medium"
        >
          <Plus size={14} /> Add another machine
        </button>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-ember hover:bg-ember-dark"
          >
            {saving ? "Saving..." : "Save equipment"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/account")}
          >
            Skip for now
          </Button>
        </div>
      </form>
    </div>
  );
}