"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "@/components/ImageUploader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "PACKAGING",
    price: "",
    depositPercent: "",
    leadTimeDays: "",
    stripePriceId: "",
    isSubscribable: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-ash hover:text-char mb-6">
        <ArrowLeft size={14} /> Back to products
      </Link>
      <h1 className="font-display font-semibold text-2xl text-char mb-8">New product</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Product images</Label>
            <ImageUploader value={images} onChange={setImages} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Product name</Label>
            <Input id="name" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Premium Coffee Cups 12oz" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" required rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <select value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ember">
              <option value="PACKAGING">Packaging</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price">Price (USD)</Label>
            <Input id="price" type="number" step="0.01" required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>

          {form.category === "EQUIPMENT" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Deposit %</Label>
                <Input type="number" min="1" max="100" placeholder="e.g. 30"
                  value={form.depositPercent}
                  onChange={(e) => setForm({ ...form, depositPercent: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Lead time (days)</Label>
                <Input type="number" placeholder="e.g. 21"
                  value={form.leadTimeDays}
                  onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })} />
              </div>
            </div>
          )}

          {form.category === "PACKAGING" && (
            <>
              <div className="space-y-1.5">
                <Label>Stripe Price ID <span className="text-ash text-xs">(subscriptions)</span></Label>
                <Input placeholder="price_XXXXXX" value={form.stripePriceId}
                  onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isSubscribable" checked={form.isSubscribable}
                  onChange={(e) => setForm({ ...form, isSubscribable: e.target.checked })}
                  className="accent-ember w-4 h-4" />
                <Label htmlFor="isSubscribable" className="cursor-pointer">Allow auto-reorder</Label>
              </div>
            </>
          )}

          <Button type="submit" disabled={saving} className="w-full text-white bg-ember hover:bg-ember-dark">
            {saving ? "Creating..." : "Create product"}
          </Button>
        </form>
      </Card>
    </div>
  );
}