import { getSellerProfile } from "@/features/seller/seller-actions";
import { ProfileForm } from "@/features/seller/components/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SellerProfilePage() {
  const result = await getSellerProfile();
  const seller = result.seller;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Store Profile</h2>
        <p className="text-muted-foreground">
          Manage your store details and payout configuration.
        </p>
      </div>
      {seller && (
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>
              Your current verification and payout status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                seller.status === "active"
                  ? "default"
                  : seller.status === "suspended"
                    ? "destructive"
                    : "secondary"
              }
            >
              {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
            </Badge>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>
            Update your storefront branding and payout details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initialData={seller} onSuccess={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
}
