import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import EquipmentCheckoutClient from "@/components/EquipmentCheckoutClient";

export default async function EquipmentCheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/equipment/checkout");

  return <EquipmentCheckoutClient addresses={user.addresses ?? []} />;
}