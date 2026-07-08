import AddressesClient from "@/components/AdressesClient";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <AddressesClient addresses={user.addresses ?? []} />;
}