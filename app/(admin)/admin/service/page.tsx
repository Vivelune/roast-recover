import { prisma } from "@/lib/prisma";
import { updateTicketStatus, addServiceLog } from "@/app/actions/maintenance";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wrench } from "lucide-react";

export default async function AdminServicePage() {
  const tickets = await prisma.serviceTicket.findMany({
    include: {
      equipment: { include: { product: true } },
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    open: "bg-red-50 text-red-700 border-red-200",
    in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
    closed: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        Service tickets
      </h1>

      {tickets.length === 0 ? (
        <div className="text-center py-16">
          <Wrench size={24} className="text-ash mx-auto mb-3" />
          <p className="text-char font-medium mb-1">No service tickets</p>
          <p className="text-ash text-sm">
            Customer service requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-medium text-char text-sm mb-0.5">
                    {ticket.equipment.product.name}
                  </p>
                  <p className="text-xs text-ash">
                    {ticket.user.email} ·{" "}
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={statusColors[ticket.status] ?? ""}
                >
                  {ticket.status.replace("_", " ")}
                </Badge>
              </div>

              <p className="text-sm text-char mb-4 bg-steam/40 rounded-md px-3 py-2">
                {ticket.issue}
              </p>

              {/* Update status */}
              <form
                action={async (formData) => {
                  "use server";
                  await updateTicketStatus(
                    ticket.id,
                    formData.get("status") as string,
                    formData.get("notes") as string
                  );
                }}
                className="grid grid-cols-2 gap-3 mb-3"
              >
                <select
                  name="status"
                  defaultValue={ticket.status}
                  className="border border-border rounded-md px-3 py-2 text-sm bg-white"
                >
                  {["open", "in_progress", "resolved", "closed"].map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="outline" size="sm">
                  Update status
                </Button>
              </form>

              {/* Add service log */}
              <details className="mt-2">
                <summary className="text-xs text-ember cursor-pointer hover:underline">
                  + Add service log entry
                </summary>
                <form
                  action={async (formData) => {
                    "use server";
                    await addServiceLog({
                      equipmentId: ticket.equipmentId,
                      servicedAt: formData.get("servicedAt") as string,
                      servicedBy: formData.get("servicedBy") as string,
                      description: formData.get("description") as string,
                      cost: formData.get("cost") as string,
                      nextServiceDue: formData.get("nextServiceDue") as string,
                    });
                  }}
                  className="mt-3 space-y-3 border border-border rounded-lg p-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Date serviced</Label>
                      <Input
                        name="servicedAt"
                        type="date"
                        required
                        defaultValue={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Serviced by</Label>
                      <Input
                        name="servicedBy"
                        placeholder="Technician name"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">What was done</Label>
                    <Textarea
                      name="description"
                      placeholder="Describe the service work..."
                      rows={2}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Cost (USD, optional)</Label>
                      <Input
                        name="cost"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Next service due (optional)</Label>
                      <Input name="nextServiceDue" type="date" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-graphite text-white hover:bg-dark-roast"
                  >
                    Save service log
                  </Button>
                </form>
              </details>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}