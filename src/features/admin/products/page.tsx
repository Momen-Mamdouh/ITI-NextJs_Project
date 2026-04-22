import { fetchProducts } from "@/features/products/product-actions";
import { fetchCategories } from "@/features/category/category-actions";
import { ProductTable } from "@/features/admin/components/ProductTable";
import { requireAuth } from "@/lib/auth";

export default async function ProductsPage() {
  const session = await requireAuth(["admin", "seller"]);
  const [productsResult] = await Promise.all([
    fetchProducts({
      sellerId: session.role === "seller" ? session.id : undefined,
    }),
    fetchCategories(),
  ]);

  if (!productsResult.success)
    return <div className="p-6 text-destructive">Error loading products</div>;

  return (
    <ProductTable products={productsResult.data || []} sellerId={session.id} />
  );
}
