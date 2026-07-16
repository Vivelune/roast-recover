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
  planned: "bg-gray-100 text-gray-600 border-gray-200",
  in_production: "bg-purple-50 text-purple-700 border-purple-200",
  quality_check: "bg-amber-50 text-amber-700 border-amber-200",
  ready_to_ship: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-green-50 text-green-700 border-green-200",
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
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight mb-2">
          Production Batches
        </h1>
        <p className="text-sm text-ash">
          Track upcoming factory runs, monitor current work-in-progress inventories, and update fulfillment ETAs.
        </p>
      </div>

      {/* Create New Batch Card */}
      <Card className="p-6 sm:p-8 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
        <h2 className="font-bold text-char text-base mb-6 flex items-center gap-2">
          <Plus size={18} /> Schedule Production Batch
        </h2>
        <form action={createBatch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="productId" className="text-xs font-bold uppercase tracking-wider text-char">
              Equipment Product
            </Label>
            <select
              id="productId"
              name="productId"
              required
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold bg-white text-char focus:outline-none focus:ring-1 focus:ring-char"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} className="text-xs">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity" className="text-xs font-bold uppercase tracking-wider text-char">
              Quantity (Units)
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              required
              placeholder="e.g. 10"
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eta" className="text-xs font-bold uppercase tracking-wider text-char">
              Target ETA
            </Label>
            <Input
              id="eta"
              name="eta"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
          </div>
          <Button 
            type="submit" 
            className="bg-char hover:bg-char/90 text-white rounded-xl h-10 px-6 font-bold uppercase tracking-wider text-xs w-full lg:w-auto"
          >
            Create Batch
          </Button>
        </form>
      </Card>

      {/* Batch List */}
      <div className="space-y-6">
        <h2 className="font-bold text-char text-lg">Active &amp; Completed Runs</h2>

        {batches.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-2xl bg-white">
            <div className="w-12 h-12 rounded-2xl bg-steam flex items-center justify-center text-ash mx-auto mb-4 border border-gray-100">
              <Factory size={20} className="text-char" />
            </div>
            <p className="text-char font-semibold">No batches on record</p>
            <p className="text-ash text-xs mt-1">
              Initiate a production run above to track scheduled supply chain operations.
            </p>
          </div>
        ) : (
          <Card className="overflow-hidden border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl">
            <div className="w-full overflow-x-auto no-scrollbar">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-[#FBFBFA] border-b border-gray-150">
                  <tr>
                    {["Product", "Qty", "Status", "Target ETA", "Created At", "Quick Status Update"].map(
                      (h) => (
                        <th key={h} className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-ash">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-steam/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-char">
                        {batch.product.name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-char">
                        {batch.quantity}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center border rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${batchStatusColor[batch.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {batch.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-char">
                        {batch.eta ? (
                          new Date(batch.eta).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        ) : (
                          <span className="text-ash italic font-normal">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-ash">
                        {new Date(batch.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <form action={updateBatchStatus} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={batch.id} />
                          <select
                            name="status"
                            defaultValue={batch.status}
                            className="border border-gray-200 rounded-lg text-xs font-semibold px-2 py-1.5 bg-white text-char focus:outline-none focus:ring-1 focus:ring-char h-[32px]"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="text-[10px] font-bold uppercase tracking-wider bg-char text-white px-3 py-1.5 rounded-lg hover:bg-char/95 transition-colors h-[32px]"
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
          </Card>
        )}
      </div>
    </div>
  );
}