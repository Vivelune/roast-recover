"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getOrCreateOnboarding() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const existing = await prisma.onboardingProgress.findUnique({
    where: { userId: user.id },
  });
  if (existing) return existing;

  return prisma.onboardingProgress.create({
    data: { userId: user.id },
  });
}

export async function markOnboardingStep(
  step:
    | "addressAdded"
    | "equipmentDeclared"
    | "firstPackagingBrowse"
    | "firstOrder"
    | "profileComplete"
) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.onboardingProgress.upsert({
    where: { userId: user.id },
    update: { [step]: true },
    create: { userId: user.id, [step]: true },
  });

  // Check if all complete
  const progress = await prisma.onboardingProgress.findUnique({
    where: { userId: user.id },
  });
  if (
    progress?.addressAdded &&
    progress.equipmentDeclared &&
    progress.firstPackagingBrowse &&
    progress.firstOrder &&
    !progress.completedAt
  ) {
    await prisma.onboardingProgress.update({
      where: { userId: user.id },
      data: { completedAt: new Date() },
    });
  }

  revalidatePath("/account");
}

export async function declareExistingEquipment(
  items: { name: string; brand?: string; installYear?: string }[]
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const fallbackProduct = await prisma.product.findFirst({
    where: { category: "EQUIPMENT", active: true },
    orderBy: { createdAt: "asc" },
  });

  if (!fallbackProduct) {
    await markOnboardingStep("equipmentDeclared");
    return;
  }

  for (const item of items) {
    if (!item.name.trim()) continue;

    const exactMatch = await prisma.product.findFirst({
      where: {
        category: "EQUIPMENT",
        active: true,
        OR: [
          { name: { contains: item.name, mode: "insensitive" } },
          item.brand
            ? { name: { contains: item.brand, mode: "insensitive" } }
            : {},
        ],
      },
    });

    const productToUse = exactMatch ?? fallbackProduct;

    const existing = await prisma.equipmentRegistryItem.findFirst({
      where: {
        userId: user.id,
        customName: item.name.trim(),   // ← check by custom name, not product
      },
    });

    if (!existing) {
      await prisma.equipmentRegistryItem.create({
        data: {
          userId: user.id,
          productId: productToUse.id,
          customName: item.name.trim(),          // ← store what they typed
          customBrand: item.brand?.trim() || null,
          installedAt: item.installYear
            ? new Date(`${item.installYear}-01-01`)
            : null,
        },
      });
    }
  }

  await markOnboardingStep("equipmentDeclared");
  revalidatePath("/account/equipment");
}