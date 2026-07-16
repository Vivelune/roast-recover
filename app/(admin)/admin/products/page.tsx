import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import DeleteProductButton from "@/components/DeleteProductButton";

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

  async function deleteProduct(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;

    const activeOrders = await prisma.orderItem.count({
      where: {
        productId: id,
        order: {
          status: {
            notIn: ["DELIVERED", "CANCELLED", "PAID"],
          },
        },
      },
    });

    if (activeOrders > 0) {
      await prisma.product.update({
        where: { id },
        data: { active: false },
      });
    } else {
      await prisma.product.delete({ where: { id } });
    }

    revalidatePath("/admin/products");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
            Products
          </h1>
          <p className="text-xs sm:text-sm text-ash mt-1">Manage physical inventory and equipment.</p>
        </div>
        <Button asChild className="bg-ember hover:bg-ember-dark text-white font-semibold self-start sm:self-center">
          <Link href="/admin/products/new">
            <Plus size={15} className="mr-1.5" /> New product
          </Link>
        </Button>
      </div>

      <div className="border border-gray-150 rounded-xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-[#FBFBFA] border-b border-gray-150">
              <tr>
                {["Name", "Category", "Price", "Deposit", "Stock", "Certified", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-[11px] font-bold text-ash uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-steam/10 transition-colors"
                >
                  <td className="px-5 py-4 font-semibold text-char max-w-[200px] truncate">
                    {p.name}
                  </td>
                  <td className="px-5 py-4 text-ash text-xs font-medium uppercase tracking-wider">{p.category}</td>
                  <td className="px-5 py-4 font-semibold text-char">
                    ${(p.priceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-4 text-ash text-xs font-medium">
                    {p.depositPercent ? `${p.depositPercent}%` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {p.stockQty !== null ? (
                      <span
                        className={`text-sm font-semibold ${
                          p.stockQty === 0
                            ? "text-red-600"
                            : p.stockQty <= (p.lowStockThreshold ?? 10)
                            ? "text-amber-600"
                            : "text-char"
                        }`}
                      >
                        {p.stockQty}
                      </span>
                    ) : (
                      <span className="text-xs text-ash font-medium">Unlimited (∞)</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {p.certification ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded">
                        {p.certification.type}
                      </span>
                    ) : (
                      <span className="text-xs text-ash">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border whitespace-nowrap ${
                        p.active
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : "bg-gray-50 border-gray-200 text-gray-500"
                      }`}
                    >
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      {/* Edit */}
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-ash hover:text-char transition-colors p-1"
                        title="Edit product"
                      >
                        <Pencil size={14} />
                      </Link>

                      {/* Toggle visibility status */}
                      <form action={toggleActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(p.active)}
                        />
                        <button
                          type="submit"
                          className="text-xs font-bold text-ember hover:text-ember-dark transition-colors px-1"
                        >
                          {p.active ? "Hide" : "Show"}
                        </button>
                      </form>

                      {/* Delete */}
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <DeleteProductButton productName={p.name} />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}