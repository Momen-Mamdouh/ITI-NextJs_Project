import { fetchBanners } from "@/features/content/content-actions";
import { BannerTable } from "@/features/admin/components/BannerTable";

export default async function BannersPage() {
  const result = await fetchBanners();
  if (!result.success)
    return <div className="p-6 text-destructive">Failed to load banners</div>;
  return <BannerTable banners={result.data || []} />;
}
