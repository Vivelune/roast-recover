import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckoutClient from "@/components/CheckoutClient";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/checkout");

  return <CheckoutClient addresses={user.addresses ?? []} />;
}