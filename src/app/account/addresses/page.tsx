import { getProfile } from "@/features/user/actions";
import { AddressList } from "@/features/user/components/AddressList";
import { redirect } from "next/navigation";

export default async function AddressesPage() {
  const result = await getProfile();

  if (!result.success || !result.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Addresses</h1>
        <p className="text-sm text-muted-foreground">
          Manage your shipping addresses
        </p>
      </div>
      <AddressList addresses={result.user.addresses || []} />
    </div>
  );
}
