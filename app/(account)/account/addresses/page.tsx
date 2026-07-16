import AddressesClient from "@/components/AdressesClient";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return(
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      <AddressesClient addresses={user.addresses ?? []} />
    </div>
  );
}