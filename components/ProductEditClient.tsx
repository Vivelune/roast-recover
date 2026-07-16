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
  const [saving, setSaving] = useState(false);

  const isEquipment = product.category === "EQUIPMENT";
  const isPackaging = product.category === "PACKAGING";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      // Inject the images array as JSON (can't pass arrays through native form)
      formData.set("images", JSON.stringify(images));
      await updateAction(formData);
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Images */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-char">Product Media</Label>
          <ImageUploader value={images} onChange={setImages} />
        </div>

        <Separator />

        {/* Core Info */}
        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ash">General Information</p>
          
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-char">Product name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={product.name}
              className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shortDesc" className="text-xs font-semibold text-char">
              Short description <span className="text-ash font-normal text-[11px]">(Result snippet)</span>
            </Label>
            <Input
              id="shortDesc"
              name="shortDesc"
              placeholder="e.g. High-volume dual-boiler for busy café service"
              defaultValue={product.shortDesc ?? ""}
              className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char placeholder:text-ash"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-char">Full Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={product.description}
              className="border-gray-200 focus-visible:ring-ember bg-white text-char"
            />
          </div>
        </div>

        <Separator />

        {/* Price */}
        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ash font-semibold">Pricing</p>
          <div className="space-y-1.5 max-w-xs">
            <Label htmlFor="price" className="text-xs font-semibold text-char">Price (USD)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              required
              defaultValue={(product.priceCents / 100).toFixed(2)}
              className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char"
            />
          </div>
        </div>

        {/* ── EQUIPMENT ONLY ─────────────────────────────────── */}
        {isEquipment && (
          <>
            <Separator />
            <div className="space-y-4 bg-[#FBFBFA] border border-gray-200/60 p-4 rounded-xl">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ash">Equipment Settings</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="depositPercent" className="text-xs font-semibold text-char">Required Deposit (%)</Label>
                  <Input
                    id="depositPercent"
                    name="depositPercent"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 30"
                    defaultValue={product.depositPercent ?? ""}
                    className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="leadTimeDays" className="text-xs font-semibold text-char">Lead time (days)</Label>
                  <Input
                    id="leadTimeDays"
                    name="leadTimeDays"
                    type="number"
                    placeholder="e.g. 21"
                    defaultValue={product.leadTimeDays ?? ""}
                    className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="machineType" className="text-xs font-semibold text-char">Machine type</Label>
                <select
                  id="machineType"
                  name="machineType"
                  defaultValue={product.machineType ?? ""}
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

        {/* ── PACKAGING ONLY ─────────────────────────────────── */}
        {isPackaging && (
          <>
            <Separator />
            <div className="space-y-4 bg-[#FBFBFA] border border-gray-200/60 p-4 rounded-xl">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ash">Packaging Configurations</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="stockQty" className="text-xs font-semibold text-char">
                    Stock quantity <span className="text-ash font-normal">(blank = unlimited)</span>
                  </Label>
                  <Input
                    id="stockQty"
                    name="stockQty"
                    type="number"
                    min="0"
                    placeholder="e.g. 200"
                    defaultValue={product.stockQty ?? ""}
                    className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lowStockThreshold" className="text-xs font-semibold text-char">Low stock alert at</Label>
                  <Input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    min="1"
                    defaultValue={product.lowStockThreshold ?? 10}
                    className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="packageSize" className="text-xs font-semibold text-char">Cup size</Label>
                  <select
                    id="packageSize"
                    name="packageSize"
                    defaultValue={product.packageSize ?? ""}
                    className="w-full border border-gray-200 rounded-md px-3 h-10 text-xs bg-white text-char font-semibold focus:outline-none focus:ring-1 focus:ring-ember"
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
                  <Label htmlFor="material" className="text-xs font-semibold text-char">Material</Label>
                  <select
                    id="material"
                    name="material"
                    defaultValue={product.material ?? ""}
                    className="w-full border border-gray-200 rounded-md px-3 h-10 text-xs bg-white text-char font-semibold focus:outline-none focus:ring-1 focus:ring-ember"
                  >
                    <option value="">Any / N/A</option>
                    <option value="paper">Paper</option>
                    <option value="compostable">Compostable</option>
                    <option value="plastic">Plastic</option>
                    <option value="PLA">PLA</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="caseQty" className="text-xs font-semibold text-char">Units per case</Label>
                  <Input
                    id="caseQty"
                    name="caseQty"
                    type="number"
                    placeholder="e.g. 500"
                    defaultValue={product.caseQty ?? ""}
                    className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="stripePriceId" className="text-xs font-semibold text-char">
                    Stripe Price ID <span className="text-ash font-normal">(for automated subscriptions)</span>
                  </Label>
                  <Input
                    id="stripePriceId"
                    name="stripePriceId"
                    placeholder="price_XXXXXX"
                    defaultValue={product.stripePriceId ?? ""}
                    className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char placeholder:text-ash"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isSubscribable"
                    name="isSubscribable"
                    defaultChecked={product.isSubscribable}
                    className="accent-ember w-4 h-4 rounded cursor-pointer"
                  />
                  <Label htmlFor="isSubscribable" className="text-xs font-semibold text-char cursor-pointer">
                    Allow automated recurring subscriptions (auto-reorder)
                  </Label>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Tags */}
        <div className="space-y-1.5">
          <Label htmlFor="tags" className="text-xs font-semibold text-char">
            Search Tags <span className="text-ash font-normal">(comma-separated)</span>
          </Label>
          <Input
            id="tags"
            name="tags"
            placeholder="e.g. dual-boiler, NSF, high-volume"
            defaultValue={product.tags?.join(", ") ?? ""}
            className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char placeholder:text-ash"
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full text-white bg-ember hover:bg-ember-dark h-11 text-xs uppercase tracking-wider font-bold transition-all shadow-sm">
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </form>
    </Card>
  );
}

const Separator = () => (
  <hr className="border-t border-gray-100 my-4" />
);