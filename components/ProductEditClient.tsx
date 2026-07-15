"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "@/components/ImageUploader";

type Product = {
  id: string;
  name: string;
  description: string;
  shortDesc: string | null;
  category: string;
  priceCents: number;
  depositPercent: number | null;
  leadTimeDays: number | null;
  stripePriceId: string | null;
  isSubscribable: boolean;
  images: string[];
  machineType: string | null;
  packageSize: string | null;
  material: string | null;
  caseQty: number | null;
  stockQty: number | null;
  lowStockThreshold: number | null;
  tags: string[];
};

export default function ProductEditClient({
  product,
  updateAction,
}: {
  product: Product;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const [images, setImages] = useState<string[]>(product.images ?? []);

  const isEquipment = product.category === "EQUIPMENT";
  const isPackaging = product.category === "PACKAGING";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Inject the images array as JSON (can't pass arrays through native form)
    formData.set("images", JSON.stringify(images));
    await updateAction(formData);
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Images */}
        <div className="space-y-1.5">
          <Label>Product images</Label>
          <ImageUploader value={images} onChange={setImages} />
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={product.name}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={3}
            defaultValue={product.description}
          />
        </div>

        {/* Short description */}
        <div className="space-y-1.5">
          <Label htmlFor="shortDesc">
            Short description{" "}
            <span className="text-ash text-xs">(shown in search results)</span>
          </Label>
          <Input
            id="shortDesc"
            name="shortDesc"
            placeholder="One-line summary..."
            defaultValue={product.shortDesc ?? ""}
          />
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={(product.priceCents / 100).toFixed(2)}
          />
        </div>

        {/* ── EQUIPMENT ONLY ─────────────────────────────────── */}
        {isEquipment && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="depositPercent">Deposit %</Label>
                <Input
                  id="depositPercent"
                  name="depositPercent"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 30"
                  defaultValue={product.depositPercent ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="leadTimeDays">Lead time (days)</Label>
                <Input
                  id="leadTimeDays"
                  name="leadTimeDays"
                  type="number"
                  placeholder="e.g. 21"
                  defaultValue={product.leadTimeDays ?? ""}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="machineType">Machine type</Label>
              <select
                id="machineType"
                name="machineType"
                defaultValue={product.machineType ?? ""}
                className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white text-char focus:outline-none focus:ring-1 focus:ring-ember"
              >
                <option value="">Select type...</option>
                <option value="espresso">Espresso machine</option>
                <option value="grinder">Grinder</option>
                <option value="batch-brew">Batch brew</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
          </>
        )}

        {/* ── PACKAGING ONLY ─────────────────────────────────── */}
        {isPackaging && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="packageSize">Cup size</Label>
                <select
                  id="packageSize"
                  name="packageSize"
                  defaultValue={product.packageSize ?? ""}
                  className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white text-char focus:outline-none focus:ring-1 focus:ring-ember"
                >
                  <option value="">Any / N/A</option>
                  <option value="4oz">4oz</option>
                  <option value="8oz">8oz</option>
                  <option value="12oz">12oz</option>
                  <option value="16oz">16oz</option>
                  <option value="20oz">20oz</option>
                  <option value="24oz">24oz</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="material">Material</Label>
                <select
                  id="material"
                  name="material"
                  defaultValue={product.material ?? ""}
                  className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white text-char focus:outline-none focus:ring-1 focus:ring-ember"
                >
                  <option value="">Any / N/A</option>
                  <option value="paper">Paper</option>
                  <option value="compostable">Compostable</option>
                  <option value="plastic">Plastic</option>
                  <option value="PLA">PLA</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="caseQty">Units per case</Label>
                <Input
                  id="caseQty"
                  name="caseQty"
                  type="number"
                  placeholder="e.g. 500"
                  defaultValue={product.caseQty ?? ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="stockQty">
                  Stock quantity{" "}
                  <span className="text-ash text-xs">(blank = unlimited)</span>
                </Label>
                <Input
                  id="stockQty"
                  name="stockQty"
                  type="number"
                  min="0"
                  placeholder="e.g. 200"
                  defaultValue={product.stockQty ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lowStockThreshold">Low stock alert at</Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  min="1"
                  defaultValue={product.lowStockThreshold ?? 10}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stripePriceId">
                Stripe Price ID{" "}
                <span className="text-ash text-xs">(subscriptions only)</span>
              </Label>
              <Input
                id="stripePriceId"
                name="stripePriceId"
                placeholder="price_XXXXXX"
                defaultValue={product.stripePriceId ?? ""}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSubscribable"
                name="isSubscribable"
                defaultChecked={product.isSubscribable}
                className="accent-ember w-4 h-4"
              />
              <Label htmlFor="isSubscribable" className="cursor-pointer">
                Allow auto-reorder subscription
              </Label>
            </div>
          </>
        )}

        {/* Tags — both categories */}
        <div className="space-y-1.5">
          <Label htmlFor="tags">
            Tags{" "}
            <span className="text-ash text-xs">(comma-separated)</span>
          </Label>
          <Input
            id="tags"
            name="tags"
            placeholder="e.g. dual-boiler, NSF, high-volume"
            defaultValue={product.tags?.join(", ") ?? ""}
          />
        </div>

        <Button type="submit" className="w-full bg-ember hover:bg-ember-dark">
          Save changes
        </Button>
      </form>
    </Card>
  );
}