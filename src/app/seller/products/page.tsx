// src/app/seller/products/page.tsx
import { fetchSellerProducts } from "@/features/seller/seller-product-actions";
import { SellerProductTable } from "@/features/seller/components/SellerProductTable";

export default async function SellerProductsPage() {
  const result = await fetchSellerProducts();
  if (!result.success)
    return (
      <div className="p-6 text-destructive">Failed to load your products</div>
    );
  return <SellerProductTable products={result.data || []} />;
}
