import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  async function updateProduct(formData: FormData) {
    "use server";
    const priceCents = Math.round(
      parseFloat(formData.get("price") as string) * 100
    );
    const depositPercent = formData.get("depositPercent")
      ? parseInt(formData.get("depositPercent") as string)
      : null;
    const leadTimeDays = formData.get("leadTimeDays")
      ? parseInt(formData.get("leadTimeDays") as string)
      : null;
    const isSubscribable = formData.get("isSubscribable") === "on";
    const stripePriceId = (formData.get("stripePriceId") as string) || null;
    const imageUrl = (formData.get("imageUrl") as string) || null;

    await prisma.product.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        priceCents,
        depositPercent,
        leadTimeDays,
        isSubscribable,
        stripePriceId,
        images: imageUrl ? [imageUrl] : [],
      },
    });

    revalidatePath("/admin/products");
    redirect("/admin/products");
  }

  return (
    <div className="max-w-xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-ash hover:text-char mb-6"
      >
        <ArrowLeft size={14} /> Back to products
      </Link>

      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        Edit product
      </h1>

      <Card className="p-6">
        <form action={updateProduct} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={product.name}
            />
          </div>

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

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input value={product.category} disabled className="bg-steam/40" />
            <p className="text-xs text-ash">Category cannot be changed after creation.</p>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="depositPercent">Deposit %</Label>
              <Input
                id="depositPercent"
                name="depositPercent"
                type="number"
                defaultValue={product.depositPercent ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="leadTimeDays">Lead time (days)</Label>
              <Input
                id="leadTimeDays"
                name="leadTimeDays"
                type="number"
                defaultValue={product.leadTimeDays ?? ""}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stripePriceId">Stripe Price ID</Label>
            <Input
              id="stripePriceId"
              name="stripePriceId"
              defaultValue={product.stripePriceId ?? ""}
              placeholder="price_XXXXXX"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={product.images?.[0] ?? ""}
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

          <Button type="submit" className="w-full bg-ember hover:bg-ember-dark">
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}