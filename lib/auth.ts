import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";

export async function getCurrentUser() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    // The user will be created with the default ROLE (CUSTOMER) 
    // defined in your schema, or you can force it as shown below.
    return await prisma.user.upsert({
      where: { email },
      update: {
        clerkId: clerkUser.id,
      },
      create: {
        email,
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
        clerkId: clerkUser.id,
        role: Role.CUSTOMER, // Using the enum from @prisma/client
      },
      include: {
        company: true,
        addresses: true,
      },
    });
  } catch {
    return null;
  }
}