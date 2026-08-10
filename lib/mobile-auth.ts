import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function requireMobileAdmin(): Promise<{
  error?: string;
  status?: number;
  userId?: string;
}> {

  const { userId } = await auth();

  if (!userId) {
    return {
      error: "Unauthorized",
      status: 401,
    };
  }


  const clerk = await clerkClient();

  const clerkUser = await clerk.users.getUser(userId);

  const email =
    clerkUser.emailAddresses[0]?.emailAddress;


  if (!email) {
    return {
      error: "No email on account",
      status: 400,
    };
  }


  const user = await prisma.user.findUnique({
    where:{
      email,
    },
  });
  console.log("CLERK USER:", email);

console.log("DATABASE USER:", user);


  if (!user || user.role !== "ADMIN") {
    return {
      error:"Admin access required",
      status:403,
    };
  }


  return {
    userId:user.id,
  };
}