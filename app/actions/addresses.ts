"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createAddress(data: {
  line1: string; line2?: string; city: string; state: string; zip: string;
}) {
    const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
 // Find your local Prisma user
 const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  const address = await prisma.address.create({
    data: {
      ...data,
      userId: user.id,
    },
  });

  revalidatePath("/checkout");

  return address;
}