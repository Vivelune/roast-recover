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
    shortDesc: "",
    machineType: "",
    packageSize: "",
    material: "",
    caseQty: "",
    tags: "",
    stockQty: "",
    lowStockThreshold: "10",
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
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ash hover:text-char transition-colors">
        <ArrowLeft size={13} /> Back to products
      </Link>
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">New Product</h1>
        <p className="text-xs sm:text-sm text-ash mt-1">Fill in the specifications below to list a new item.</p>
      </div>

      <Card className="p-5 sm:p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Images Section */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-char">Product Media</Label>
            <ImageUploader value={images} onChange={setImages} />
          </div>

          <Separator className="border-gray-100" />

          {/* Core Info */}
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ash">General Information</p>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-char">Product Name</Label>
              <Input id="name" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Premium Coffee Cups 12oz"
                className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char placeholder:text-ash" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shortDesc" className="text-xs font-semibold text-char">Short Description <span className="text-ash font-normal text-[11px]">(Result snippet)</span></Label>
              <Input
                id="shortDesc"
                placeholder="e.g. High-volume dual-boiler for busy café service"
                value={form.shortDesc}
                onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char placeholder:text-ash"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-char">Full Description</Label>
              <Textarea id="description" required rows={4} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border-gray-200 focus-visible:ring-ember bg-white text-char" />
            </div>
          </div>

          <Separator className="border-gray-100" />

          {/* Pricing & Classification */}
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ash">Pricing &amp; Cataloging</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-char">Category</Label>
                <select value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-3 h-10 text-sm bg-white text-char font-semibold focus:outline-none focus:ring-1 focus:ring-ember">
                  <option value="PACKAGING">Packaging</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-semibold text-char">Price (USD)</Label>
                <Input id="price" type="number" step="0.01" required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char" />
              </div>
            </div>
          </div>

          {/* Packaging Category Specific Fields */}
          {form.category === "PACKAGING" && (
            <>
              <Separator className="border-gray-100" />
              <div className="space-y-4 bg-[#FBFBFA] border border-gray-200/60 p-4 rounded-xl">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ash">Packaging Configurations</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-char">Stock Quantity <span className="text-ash font-normal">(blank = unlimited)</span></Label>
                    <Input
                      type="number"
                      placeholder="e.g. 500"
                      value={form.stockQty}
                      onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                      className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-char">Low Stock Threshold</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={form.lowStockThreshold}
                      onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                      className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-char">Cup Size</Label>
                    <select
                      value={form.packageSize}
                      onChange={(e) => setForm({ ...form, packageSize: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-3 h-10 text-xs bg-white text-char font-semibold focus:outline-none focus:ring-1 focus:ring-ember"
                    >
                      <option value="">Any</option>
                      <option value="4oz">4oz</option>
                      <option value="8oz">8oz</option>
                      <option value="12oz">12oz</option>
                      <option value="16oz">16oz</option>
                      <option value="20oz">20oz</option>
                      <option value="24oz">24oz</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-char">Material</Label>
                    <select
                      value={form.material}
                      onChange={(e) => setForm({ ...form, material: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-3 h-10 text-xs bg-white text-char font-semibold focus:outline-none focus:ring-1 focus:ring-ember"
                    >
                      <option value="">Any</option>
                      <option value="paper">Paper</option>
                      <option value="compostable">Compostable</option>
                      <option value="plastic">Plastic</option>
                      <option value="PLA">PLA</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-char">Case Qty</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 500"
                      value={form.caseQty}
                      onChange={(e) => setForm({ ...form, caseQty: e.target.value })}
                      className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-char">Stripe Price ID <span className="text-ash font-normal">(for automated subscriptions)</span></Label>
                    <Input placeholder="price_XXXXXX" value={form.stripePriceId}
                      onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })}
                      className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char placeholder:text-ash" />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="isSubscribable" checked={form.isSubscribable}
                      onChange={(e) => setForm({ ...form, isSubscribable: e.target.checked })}
                      className="accent-ember w-4 h-4 rounded cursor-pointer" />
                    <Label htmlFor="isSubscribable" className="text-xs font-semibold text-char cursor-pointer">Allow automated recurring subscriptions (auto-reorder)</Label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Equipment Category Specific Fields */}
          {form.category === "EQUIPMENT" && (
            <>
              <Separator className="border-gray-100" />
              <div className="space-y-4 bg-[#FBFBFA] border border-gray-200/60 p-4 rounded-xl">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ash">Equipment Settings</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-char">Required Deposit (%)</Label>
                    <Input type="number" min="1" max="100" placeholder="e.g. 30"
                      value={form.depositPercent}
                      onChange={(e) => setForm({ ...form, depositPercent: e.target.value })}
                      className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-char">Lead Time (days)</Label>
                    <Input type="number" placeholder="e.g. 21"
                      value={form.leadTimeDays}
                      onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
                      className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-char">Machine Type</Label>
                  <select
                    value={form.machineType}
                    onChange={(e) => setForm({ ...form, machineType: e.target.value })}
                    className="w-full border border-gray-200 rounded-md px-3 h-10 text-xs bg-white text-char font-semibold focus:outline-none focus:ring-1 focus:ring-ember"
                  >
                    <option value="">Select type...</option>
                    <option value="espresso">Espresso machine</option>
                    <option value="grinder">Grinder</option>
                    <option value="batch-brew">Batch brew</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <Separator className="border-gray-100" />

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-char">Search Tags <span className="text-ash font-normal">(comma-separated)</span></Label>
            <Input
              placeholder="e.g. dual-boiler, high-volume, NSF, 58mm"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char placeholder:text-ash"
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full text-white bg-ember hover:bg-ember-dark h-11 text-xs uppercase tracking-wider font-bold transition-all">
            {saving ? "Creating..." : "Create Product Listing"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

const Separator = ({ className }: { className?: string }) => (
  <hr className={`border-t border-gray-100 my-4 ${className}`} />
);