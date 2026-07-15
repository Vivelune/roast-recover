"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { markOnboardingStep } from "./onboarding";

export async function createCompany(name: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const company = await prisma.company.create({
    data: {
      name,
      users: { connect: { id: user.id } },
      members: {
        create: { userId: user.id, role: "OWNER" },
      },
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { companyId: company.id },
  });
  try {
    await markOnboardingStep("profileComplete");
  } catch {}
  revalidatePath("/account/company");
  return company;
  
}

export async function inviteMember(
  companyId: string,
  email: string,
  role: "MANAGER" | "VIEWER",
  location?: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const membership = await prisma.companyMember.findFirst({
    where: { companyId, userId: user.id, role: "OWNER" },
  });
  if (!membership) throw new Error("Only owners can invite members");

  const invitee = await prisma.user.findUnique({ where: { email } });
  if (!invitee) {
    throw new Error(
      "No account found with that email. Ask them to sign up first."
    );
  }

  // Add to company members
  await prisma.companyMember.upsert({
    where: { companyId_userId: { companyId, userId: invitee.id } },
    update: { role, location },
    create: { companyId, userId: invitee.id, role, location },
  });

  // Always re-link their user record to the company
  await prisma.user.update({
    where: { id: invitee.id },
    data: { companyId },
  });

  revalidatePath("/account/company");
}

export async function removeMember(companyId: string, userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not signed in");

  // Verify current user is owner
  const membership = await prisma.companyMember.findFirst({
    where: { companyId, userId: currentUser.id, role: "OWNER" },
  });
  if (!membership) throw new Error("Only owners can remove members");

  // Delete the membership record
  await prisma.companyMember.delete({
    where: { companyId_userId: { companyId, userId } },
  });

  // Clear the companyId on the user so they no longer see the company
  await prisma.user.update({
    where: { id: userId },
    data: { companyId: null },
  });

  revalidatePath("/account/company");
}