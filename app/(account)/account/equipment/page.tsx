import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck, Calendar, Wrench, AlertTriangle,
  CheckCircle2, Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ServiceTicketForm from "@/components/ServiceTicketForm";

export default async function EquipmentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const equipment = await prisma.equipmentRegistryItem.findMany({
    where: { userId: user.id },
    include: {
      product: { include: { certification: true } },
      order: true,
      serviceLogs: { orderBy: { servicedAt: "desc" } },
      serviceTickets: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { installedAt: "desc" },
  });

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* Header section with corrected Declare Button link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char tracking-tight">
            Equipment Registry
          </h1>
          <p className="text-ash text-sm mt-0.5">
            All machines in your registry — purchased through us or declared manually.
          </p>
        </div>
        <Button
          asChild
          className="bg-[#B5481F] hover:bg-[#9E3E1A] text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs self-start sm:self-auto shrink-0 transition-colors"
        >
          <Link href="/account/equipment/declare">
            <Plus size={14} className="mr-1.5" /> Declare Equipment
          </Link>
        </Button>
      </div>

      {/* Empty State */}
      {equipment.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-2xl bg-white">
          <div className="w-12 h-12 rounded-2xl bg-steam flex items-center justify-center text-ash mx-auto mb-4 border border-gray-100">
            <Wrench size={20} className="text-[#B5481F]" />
          </div>
          <p className="text-char font-semibold">No equipment registered yet</p>
          <p className="text-ash text-xs mt-1 mb-6 max-w-xs mx-auto">
            Equipment ordered from us appears here automatically. You can also register existing assets.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-xs mx-auto">
            <Button asChild className="bg-[#B5481F] hover:bg-[#9E3E1A] text-white rounded-xl h-10 px-4 font-bold uppercase tracking-wider text-xs transition-colors">
              <Link href="/packaging">Browse Store</Link>
            </Button>
            {/* Corrected Empty State Button link */}
            <Button asChild variant="outline" className="rounded-xl h-10 px-4 text-xs font-bold uppercase tracking-wider border-gray-200 text-char">
              <Link href="/account/equipment/declare">Declare Machinery</Link>
            </Button>
          </div>
        </div>
      ) : (
        /* Machinery Card Lists */
        <div className="space-y-6">
          {equipment.map((item) => {
            const displayName = item.customName ?? item.product.name;
            const displayBrand = item.customBrand;
            const isPurchasedFromRR = !item.customName && item.orderId;

            const warrantyExpiringSoon =
              item.warrantyEndsAt &&
              item.warrantyEndsAt > now &&
              item.warrantyEndsAt < thirtyDaysFromNow;
            const warrantyExpired =
              item.warrantyEndsAt && item.warrantyEndsAt < now;
            const lastService = item.serviceLogs[0];
            const nextServiceDue = lastService?.nextServiceDue;
            const serviceOverdue = nextServiceDue && nextServiceDue < now;
            const serviceDueSoon =
              nextServiceDue &&
              nextServiceDue > now &&
              nextServiceDue < thirtyDaysFromNow;
            const openTicket = item.serviceTickets.find(
              (t) => t.status === "open" || t.status === "in_progress"
            );

            return (
              <Card key={item.id} className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display font-semibold text-lg text-char tracking-tight">{displayName}</h2>
                      {!isPurchasedFromRR && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-steam border border-gray-200/50 text-ash px-2 py-0.5 rounded-md">
                          External
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ash font-medium">
                      {displayBrand && (
                        <span className="font-bold text-char">
                          {displayBrand}
                        </span>
                      )}
                      {item.product.certification && !item.customName && (
                        <span className="flex items-center gap-1">
                          <ShieldCheck size={13} className="text-[#B5481F]" />
                          {item.product.certification.type} #{item.product.certification.listingNumber}
                        </span>
                      )}
                      {item.installedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          Installed {new Date(item.installedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.order && (
                    <Link
                      href={`/account/orders/${item.order.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-[#B5481F] hover:text-[#9E3E1A] transition-colors"
                    >
                      View order &rarr;
                    </Link>
                  )}
                </div>

                {/* Warranty and Service Alert Banner Grid */}
                {(item.warrantyEndsAt || nextServiceDue) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Warranty Status */}
                    {warrantyExpired ? (
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-red-700 bg-red-50/50 border border-red-200/50 rounded-xl px-4 py-3">
                        <AlertTriangle size={14} className="text-red-500 shrink-0" />
                        Warranty expired ({new Date(item.warrantyEndsAt!).toLocaleDateString()})
                      </div>
                    ) : warrantyExpiringSoon ? (
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-amber-700 bg-amber-50/50 border border-amber-200/60 rounded-xl px-4 py-3">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                        Warranty expiring soon ({new Date(item.warrantyEndsAt!).toLocaleDateString()})
                      </div>
                    ) : item.warrantyEndsAt ? (
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-green-700 bg-green-50/50 border border-green-200/50 rounded-xl px-4 py-3">
                        <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                        Warranty active until {new Date(item.warrantyEndsAt).toLocaleDateString()}
                      </div>
                    ) : null}

                    {/* Service Schedules */}
                    {serviceOverdue ? (
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-red-700 bg-red-50/50 border border-red-200/50 rounded-xl px-4 py-3">
                        <AlertTriangle size={14} className="text-red-500 shrink-0" />
                        Service overdue (due {new Date(nextServiceDue!).toLocaleDateString()})
                      </div>
                    ) : serviceDueSoon ? (
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-amber-700 bg-amber-50/50 border border-amber-200/60 rounded-xl px-4 py-3">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                        Scheduled maintenance due {new Date(nextServiceDue!).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>
                )}

                <Separator className="border-gray-100" />

                {/* Service History Details */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ash">
                    Maintenance Chronicles
                  </p>
                  {item.serviceLogs.length === 0 ? (
                    <p className="text-xs text-ash italic">No logs recorded.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {item.serviceLogs.slice(0, 3).map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-char">{log.description}</p>
                            <p className="text-xs text-ash font-medium">
                              {new Date(log.servicedAt).toLocaleDateString()} &bull; Serviced by {log.servicedBy}
                              {log.nextServiceDue &&
                                ` &bull; Next Due: ${new Date(log.nextServiceDue).toLocaleDateString()}`}
                            </p>
                          </div>
                          {log.cost && (
                            <span className="text-xs font-bold text-char bg-steam px-2.5 py-1 rounded-lg border border-gray-200/30 shrink-0">
                              ${(log.cost / 100).toFixed(0)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Open Ticket or Service Button */}
                {openTicket ? (
                  <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl px-4 py-3">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
                      Active Service Ticket
                    </p>
                    <p className="text-xs text-blue-700 font-medium">{openTicket.issue}</p>
                  </div>
                ) : (
                  <div className="border-t border-gray-100 pt-5">
                    <ServiceTicketForm equipmentId={item.id} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}