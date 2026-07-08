import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Calendar, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function EquipmentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const equipment = await prisma.equipmentRegistryItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { certification: true } }, order: true },
    orderBy: { installedAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-2">
        Equipment
      </h1>
      <p className="text-ash text-sm mb-8">
        Machines you've ordered through Roast &amp; Recover.
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
        <div className="space-y-3">
          {equipment.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-char text-sm mb-1">
                    {item.product.name}
                  </p>
                  {item.product.certification && (
                    <p className="text-xs text-ash flex items-center gap-1 mb-2">
                      <ShieldCheck size={11} className="text-ember" />
                      {item.product.certification.type} certified — #
                      {item.product.certification.listingNumber}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-ash">
                    {item.installedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        Installed{" "}
                        {new Date(item.installedAt).toLocaleDateString()}
                      </span>
                    )}
                    {item.warrantyEndsAt && (
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={11} />
                        Warranty until{" "}
                        {new Date(item.warrantyEndsAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {item.order && (
                  <Link
                    href={`/account/orders/${item.order.id}`}
                    className="text-xs text-ember flex-shrink-0"
                  >
                    View order →
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}