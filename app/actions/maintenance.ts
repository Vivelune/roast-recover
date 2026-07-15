"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function bookServiceTicket(
  equipmentId: string,
  issue: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  await prisma.serviceTicket.create({
    data: { equipmentId, userId: user.id, issue },
  });

  revalidatePath("/account/equipment");
}

export async function addServiceLog(data: {
  equipmentId: string;
  servicedAt: string;
  servicedBy: string;
  description: string;
  cost?: string;
  nextServiceDue?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.serviceLog.create({
    data: {
      equipmentId: data.equipmentId,
      servicedAt: new Date(data.servicedAt),
      servicedBy: data.servicedBy,
      description: data.description,
      cost: data.cost ? Math.round(parseFloat(data.cost) * 100) : null,
      nextServiceDue: data.nextServiceDue
        ? new Date(data.nextServiceDue)
        : null,
    },
  });

  revalidatePath("/account/equipment");
  revalidatePath("/admin/service");
}

export async function updateTicketStatus(
  ticketId: string,
  status: string,
  notes?: string
) {
  await prisma.serviceTicket.update({
    where: { id: ticketId },
    data: { status, notes },
  });

  revalidatePath("/admin/service");
}