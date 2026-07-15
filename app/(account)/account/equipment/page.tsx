import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck, Calendar, Wrench, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-semibold text-2xl text-char">
          Equipment
        </h1>
      </div>
      <p className="text-ash text-sm mb-8">
        Machines ordered through Roast & Recover, with service history and warranty tracking.
      </p>

      {equipment.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-steam flex items-center justify-center text-ash mx-auto mb-4">
            <Wrench size={20} />
          </div>
          <p className="text-char font-medium mb-1">No equipment yet</p>
          <p className="text-ash text-sm mb-5">
            Equipment appears here once your order is delivered.
          </p>
          <Button asChild className="bg-ember hover:bg-ember-dark">
            <Link href="/equipment">Browse equipment</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {equipment.map((item) => {
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
              <Card key={item.id} className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-medium text-char mb-1">
                      {item.product.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.product.certification && (
                        <span className="flex items-center gap-1 text-xs text-ash">
                          <ShieldCheck size={11} className="text-ember" />
                          {item.product.certification.type} #{item.product.certification.listingNumber}
                        </span>
                      )}
                      {item.installedAt && (
                        <span className="flex items-center gap-1 text-xs text-ash">
                          <Calendar size={11} />
                          Installed {new Date(item.installedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.order && (
                    <Link
                      href={`/account/orders/${item.order.id}`}
                      className="text-xs text-ember flex-shrink-0 hover:underline"
                    >
                      View order →
                    </Link>
                  )}
                </div>

                {/* Status alerts */}
                <div className="space-y-2 mb-4">
                  {/* Warranty */}
                  {warrantyExpired ? (
                    <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                      <AlertTriangle size={12} />
                      Warranty expired{" "}
                      {new Date(item.warrantyEndsAt!).toLocaleDateString()}
                    </div>
                  ) : warrantyExpiringSoon ? (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                      <AlertTriangle size={12} />
                      Warranty expires soon —{" "}
                      {new Date(item.warrantyEndsAt!).toLocaleDateString()}
                    </div>
                  ) : item.warrantyEndsAt ? (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2">
                      <CheckCircle2 size={12} />
                      Warranty active until{" "}
                      {new Date(item.warrantyEndsAt).toLocaleDateString()}
                    </div>
                  ) : null}

                  {/* Service due */}
                  {serviceOverdue && (
                    <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                      <AlertTriangle size={12} />
                      Service overdue — was due{" "}
                      {new Date(nextServiceDue!).toLocaleDateString()}
                    </div>
                  )}
                  {serviceDueSoon && !serviceOverdue && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                      <AlertTriangle size={12} />
                      Service due{" "}
                      {new Date(nextServiceDue!).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <Separator className="mb-4" />

                {/* Service history */}
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wide text-ash mb-3">
                    Service history
                  </p>
                  {item.serviceLogs.length === 0 ? (
                    <p className="text-sm text-ash">No service records yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {item.serviceLogs.slice(0, 3).map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start justify-between gap-4 text-sm"
                        >
                          <div>
                            <p className="text-char">{log.description}</p>
                            <p className="text-xs text-ash">
                              {new Date(log.servicedAt).toLocaleDateString()}{" "}
                              · {log.servicedBy}
                              {log.nextServiceDue &&
                                ` · Next due: ${new Date(log.nextServiceDue).toLocaleDateString()}`}
                            </p>
                          </div>
                          {log.cost && (
                            <span className="text-xs text-ash flex-shrink-0">
                              ${(log.cost / 100).toFixed(0)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Open ticket */}
                {openTicket && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4">
                    <p className="text-xs font-medium text-blue-800 mb-0.5">
                      Service ticket open
                    </p>
                    <p className="text-xs text-blue-700">{openTicket.issue}</p>
                    <Badge className="mt-1.5 text-[10px] bg-blue-100 text-blue-700 border-blue-200">
                      {openTicket.status.replace("_", " ")}
                    </Badge>
                  </div>
                )}

                {/* Book service */}
                {!openTicket && (
                  <ServiceTicketForm equipmentId={item.id} />
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}