import { getWishlist } from "@/features/user/actions";
import { WishlistGrid } from "@/features/user/components/WishlistGrid";

export default async function WishlistPage() {
  const result = await getWishlist();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
          <p className="text-sm text-muted-foreground">
            {result.items?.length ?? 0} saved items
          </p>
        </div>
      </div>
      <WishlistGrid items={result.items || []} />
    </div>
  );
}
