"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { markOnboardingStep } from "./onboarding";

export async function createAddress(data: {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const address = await prisma.address.create({
    data: { ...data, userId: user.id, country: data.country?.trim() || "United States",},
  });
  try {
    await markOnboardingStep("addressAdded");
  } catch (err) {
    console.error(
      "Failed to mark onboarding addressAdded:",
      err
    );
  }

  revalidatePath("/checkout");
  revalidatePath("/account/addresses");
  return address;
}



export async function deleteAddress(addressId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  await prisma.address.deleteMany({
    where: { id: addressId, userId: user.id },
  });

  revalidatePath("/account/addresses");
}