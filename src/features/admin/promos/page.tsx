import { fetchPromos } from "@/features/promo/promo-actions";
import { PromoTable } from "@/features/admin/components/PromoTable";

export default async function PromosPage() {
  const result = await fetchPromos();
  if (!result.success)
    return (
      <div className="p-6 text-destructive">Failed to load promo codes</div>
    );
  return <PromoTable promos={result.data || []} />;
}
