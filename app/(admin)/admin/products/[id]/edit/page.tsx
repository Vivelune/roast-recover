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
import ProductEditClient from "@/components/ProductEditClient";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { certification: true },
  });
  if (!product) notFound();

  async function updateProduct(formData: FormData) {
    "use server";

    const stockQtyRaw = formData.get("stockQty") as string;
    const caseQtyRaw = formData.get("caseQty") as string;
    const depositRaw = formData.get("depositPercent") as string;
    const leadRaw = formData.get("leadTimeDays") as string;
    const lowStockRaw = formData.get("lowStockThreshold") as string;
    const imagesRaw = formData.get("images") as string;

    await prisma.product.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        shortDesc: (formData.get("shortDesc") as string) || null,
        priceCents: Math.round(
          parseFloat(formData.get("price") as string) * 100
        ),
        isSubscribable: formData.get("isSubscribable") === "on",
        stripePriceId: (formData.get("stripePriceId") as string) || null,
        images: imagesRaw ? JSON.parse(imagesRaw) : [],
        tags:
          (formData.get("tags") as string)
            ?.split(",")
            .map((t) => t.trim())
            .filter(Boolean) ?? [],
        // Equipment fields
        depositPercent: depositRaw ? parseInt(depositRaw) : null,
        leadTimeDays: leadRaw ? parseInt(leadRaw) : null,
        machineType: (formData.get("machineType") as string) || null,
        // Packaging fields
        packageSize: (formData.get("packageSize") as string) || null,
        material: (formData.get("material") as string) || null,
        caseQty: caseQtyRaw ? parseInt(caseQtyRaw) : null,
        stockQty: stockQtyRaw !== "" ? parseInt(stockQtyRaw) : null,
        lowStockThreshold: lowStockRaw ? parseInt(lowStockRaw) : 10,
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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char mb-1">
            Edit product
          </h1>
          <p className="text-xs text-ash">
            Category:{" "}
            <span className="font-medium text-char">{product.category}</span>
          </p>
        </div>
      </div>

      <ProductEditClient product={product} updateAction={updateProduct} />
    </div>
  );
}