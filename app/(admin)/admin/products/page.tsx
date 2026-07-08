import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        Products
      </h1>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-steam/40 border-b border-border">
            <tr>
              {["Name", "Category", "Price", "Certified", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-ash"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border/50 last:border-0 hover:bg-steam/20"
              >
                <td className="px-4 py-3 font-medium text-char">{p.name}</td>
                <td className="px-4 py-3 text-ash">{p.category}</td>
                <td className="px-4 py-3 text-char">
                  ${(p.priceCents / 100).toFixed(2)}
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
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={String(p.active)}
                    />
                    <button
                      type="submit"
                      className="text-xs text-ash hover:text-ember transition-colors"
                    >
                      {p.active ? "Hide" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}