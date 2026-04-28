import { fetchSellerProducts } from "@/features/seller/seller-product-actions";
import { fetchActiveCategoryNames } from "@/features/category/category-actions";
import { fetchProductCategoryNames } from "@/features/products/product-actions";
import { SellerProductTable } from "@/features/seller/components/SellerProductTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
};

function mergeCategoryNames(a: string[], b: string[]): { name: string }[] {
  const set = new Set<string>([...a, ...b]);
  return [...set].sort((x, y) => x.localeCompare(y)).map((name) => ({ name }));
}

export default async function SellerProductsPage() {
  const [result, activeCats, productCats] = await Promise.all([
    fetchSellerProducts(),
    fetchActiveCategoryNames(),
    fetchProductCategoryNames(),
  ]);

  if (!result.success)
    return (
      <div className="p-6 text-destructive">Failed to load your products</div>
    );

  const categoryOptions = mergeCategoryNames(
    activeCats.success ? activeCats.names : [],
    productCats.success ? productCats.names : [],
  );

  return (
    <SellerProductTable
      products={result.data || []}
      categoryOptions={categoryOptions}
    />
  );
}
