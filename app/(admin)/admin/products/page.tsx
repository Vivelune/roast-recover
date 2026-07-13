import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { certification: true },
    orderBy: { createdAt: "desc" },
  });

  async function toggleActive(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const current = formData.get("active") === "true";
    await prisma.product.update({
      where: { id },
      data: { active: !current },
    });
    revalidatePath("/admin/products");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-semibold text-2xl text-char">
          Products
        </h1>
        <Button asChild className="bg-ember text-white hover:bg-ember-dark">
          <Link href="/admin/products/new">
            <Plus size={15} className="mr-1.5" /> New product
          </Link>
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-steam/40 border-b border-border">
            <tr>
              {["Name", "Category", "Price", "Deposit", "Certified", "Status", ""].map(
                (h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ash">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-steam/20">
                <td className="px-4 py-3 font-medium text-char">{p.name}</td>
                <td className="px-4 py-3 text-ash text-xs">{p.category}</td>
                <td className="px-4 py-3 text-char">
                  ${(p.priceCents / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-ash text-xs">
                  {p.depositPercent ? `${p.depositPercent}%` : "—"}
                </td>
                <td className="px-4 py-3">
                  {p.certification ? (
                    <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      {p.certification.type}
                    </span>
                  ) : (
                    <span className="text-xs text-ash">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.active ? "default" : "outline"}>
                    {p.active ? "Active" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-ash hover:text-char transition-colors"
                    >
                      <Pencil size={13} />
                    </Link>
                    <form action={toggleActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="active" value={String(p.active)} />
                      <button
                        type="submit"
                        className="text-xs text-ash hover:text-ember transition-colors"
                      >
                        {p.active ? "Hide" : "Activate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}