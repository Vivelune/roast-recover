import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CheckoutClient from "@/components/CheckoutClient";

export default async function CheckoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      // matches your Prisma relation
      // if you have user -> addresses relation
      addresses: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <CheckoutClient
      addresses={user.addresses ?? []}
    />
  );
}