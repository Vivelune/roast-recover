// lib/auth.ts
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) return null;

  return prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    include: {
      addresses: true,
      company: true,
      orders: true,
      subscriptions: true,
      equipmentItems: true,
    },
  });
}