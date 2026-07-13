import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Factory, Plus } from "lucide-react";

const batchStatusColor: Record<string, string> = {
  planned: "bg-gray-100 text-gray-600",
  in_production: "bg-purple-50 text-purple-700",
  quality_check: "bg-yellow-50 text-yellow-700",
  ready_to_ship: "bg-blue-50 text-blue-700",
  shipped: "bg-green-50 text-green-700",
};

export default async function AdminBatchesPage() {
  const [batches, products] = await Promise.all([
    prisma.productionBatch.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { category: "EQUIPMENT", active: true },
      select: { id: true, name: true },
    }),
  ]);

  async function createBatch(formData: FormData) {
    "use server";
    const productId = formData.get("productId") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const eta = formData.get("eta") as string;

    await prisma.productionBatch.create({
      data: {
        productId,
        quantity,
        status: "planned",
        eta: eta ? new Date(eta) : null,
      },
    });

    revalidatePath("/admin/batches");
  }

  async function updateBatchStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    await prisma.productionBatch.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/batches");
  }

  const statusOptions = [
    "planned",
    "in_production",
    "quality_check",
    "ready_to_ship",
    "shipped",
  ];

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        Production batches
      </h1>

      {/* Create new batch */}
      <Card className="p-5 mb-8">
        <p className="text-sm font-medium text-char mb-4 flex items-center gap-2">
          <Plus size={15} /> New batch
        </p>
        <form action={createBatch} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="productId">Equipment product</Label>
            <select
              id="productId"
              name="productId"
              required
              className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white text-char focus:outline-none focus:ring-1 focus:ring-ember"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              required
              placeholder="e.g. 10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eta">ETA</Label>
            <Input
              id="eta"
              name="eta"
              type="date"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <Button type="submit" className="bg-ember hover:bg-ember-dark">
            Create batch
          </Button>
        </form>
      </Card>

      {/* Batch list */}
      {batches.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-steam flex items-center justify-center text-ash mx-auto mb-4">
            <Factory size={20} />
          </div>
          <p className="text-char font-medium mb-1">No production batches yet</p>
          <p className="text-ash text-sm">
            Create a batch to track factory production runs.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-steam/40 border-b border-border">
              <tr>
                {["Product", "Qty", "Status", "ETA", "Created", "Update"].map(
                  (h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ash">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} className="border-b border-border/50 last:border-0 hover:bg-steam/20">
                  <td className="px-4 py-3 font-medium text-char">
                    {batch.product.name}
                  </td>
                  <td className="px-4 py-3 text-char">{batch.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${batchStatusColor[batch.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {batch.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ash">
                    {batch.eta
                      ? new Date(batch.eta).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-ash">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateBatchStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={batch.id} />
                      <select
                        name="status"
                        defaultValue={batch.status}
                        className="border border-border rounded-md text-xs px-2 py-1.5 bg-white text-char focus:outline-none focus:ring-1 focus:ring-ember"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="text-xs bg-graphite text-white px-2.5 py-1.5 rounded-md hover:bg-dark-roast transition-colors"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}