import {
  fetchProducts,
  fetchProductCategoryNames,
} from "@/features/products/product-actions";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import type { ProductView } from "@/components/shop/ProductCard";
import {
  parseProductListParams,
  type ShopSearchParams,
} from "@/lib/shop-filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

function toView(p: unknown): ProductView {
  const x = p as {
    _id: unknown;
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    stock: number;
    category: string;
    sellerId: unknown;
    isActive?: boolean;
  };
  return {
    _id: String(x._id),
    name: x.name,
    description: x.description,
    price: x.price,
    compareAtPrice: x.compareAtPrice,
    images: x.images,
    stock: x.stock,
    category: x.category,
    sellerId: String(x.sellerId),
    isActive: x.isActive,
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseProductListParams(sp);

  const [res, categoryNamesRes] = await Promise.all([
    fetchProducts(filters),
    fetchProductCategoryNames(),
  ]);

  const raw = res.success && res.data ? res.data : [];
  const initialProducts: ProductView[] = JSON.parse(JSON.stringify(raw)).map(
    toView,
  );
  const categoryNames = categoryNamesRes.success ? categoryNamesRes.names : [];
  const storeEmpty = initialProducts.length === 0 && categoryNames.length === 0;

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <ShopCatalog
          categoryNames={categoryNames}
          initialFilters={filters}
          initialProducts={initialProducts}
          storeEmpty={storeEmpty}
        />
      </div>
    </main>
  );
}
