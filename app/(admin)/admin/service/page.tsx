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
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    resolved: "bg-green-50 text-green-700 border-green-200",
    closed: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight mb-2">
          Service Tickets
        </h1>
        <p className="text-sm text-ash">
          Monitor incoming customer support requests, update status, and log machine service histories.
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-2xl bg-white">
          <div className="w-12 h-12 rounded-2xl bg-steam flex items-center justify-center text-ash mx-auto mb-4 border border-gray-100">
            <Wrench size={20} className="text-char" />
          </div>
          <p className="text-char font-semibold">All quiet here</p>
          <p className="text-ash text-xs mt-1">
            No active customer support or repair tickets on record.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="p-6 sm:p-8 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
                <div>
                  <p className="font-bold text-char text-base mb-1">
                    {ticket.equipment.product.name}
                  </p>
                  <p className="text-xs text-ash font-medium">
                    {ticket.user.email} &bull;{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase tracking-wider rounded-lg px-2.5 py-0.5 self-start sm:self-auto ${
                    statusColors[ticket.status] ?? "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {ticket.status.replace("_", " ")}
                </Badge>
              </div>

              {/* Reported Issue */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-ash mb-2">Reported Issue</p>
                <p className="text-sm text-char leading-relaxed bg-[#FBFBFA] border border-gray-100 rounded-xl px-4 py-3 whitespace-pre-wrap break-words">
                  {ticket.issue}
                </p>
              </div>

              {/* Quick status update form */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ash mb-3">TICKET OPERATIONS</p>
                <form
                  action={async (formData) => {
                    "use server";
                    await updateTicketStatus(
                      ticket.id,
                      formData.get("status") as string,
                      formData.get("notes") as string
                    );
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor={`status-${ticket.id}`} className="text-xs font-bold uppercase tracking-wider text-char">
                      Assign Status
                    </Label>
                    <select
                      id={`status-${ticket.id}`}
                      name="status"
                      defaultValue={ticket.status}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold bg-white text-char focus:outline-none focus:ring-1 focus:ring-char h-10"
                    >
                      {["open", "in_progress", "resolved", "closed"].map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="bg-char hover:bg-char/90 text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs">
                    Update status
                  </Button>
                </form>
              </div>

              {/* Add service log details section */}
              <details className="mt-6 group">
                <summary className="text-xs font-bold uppercase tracking-wider text-char cursor-pointer hover:underline list-none flex items-center gap-1.5 select-none">
                  <span className="transition-transform group-open:rotate-90">&gt;</span> Log Service Entry
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
                  className="mt-4 space-y-6 border border-gray-150 rounded-2xl p-5 sm:p-6 bg-white"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-char">Date Serviced</Label>
                      <Input
                        name="servicedAt"
                        type="date"
                        required
                        defaultValue={new Date().toISOString().split("T")[0]}
                        className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-char">Serviced By</Label>
                      <Input
                        name="servicedBy"
                        placeholder="Technician name"
                        required
                        className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-char">Technical Work Performed</Label>
                    <Textarea
                      name="description"
                      placeholder="Describe the diagnostics, replacement parts, or adjustments made..."
                      rows={3}
                      required
                      className="rounded-xl border-gray-200 focus-visible:ring-char text-xs resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-char">Cost (USD) <span className="text-ash font-normal text-[10px] lowercase italic">(optional)</span></Label>
                      <Input
                        name="cost"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-char">Next Service Due <span className="text-ash font-normal text-[10px] lowercase italic">(optional)</span></Label>
                      <Input 
                        name="nextServiceDue" 
                        type="date" 
                        className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="bg-char hover:bg-char/90 text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs w-full sm:w-auto"
                  >
                    Save Service Record
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