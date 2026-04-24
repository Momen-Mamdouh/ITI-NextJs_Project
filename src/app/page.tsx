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

function toView(p: unknown): ProductView {
  const x = p as {
    _id: unknown;
    name: string;
    description: string;
    price: number;
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
  const storeEmpty =
    initialProducts.length === 0 && categoryNames.length === 0;

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Shop
          </h1>
          <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground">
            Filters apply as you change them. Add items to your cart; sign in as
            a customer to sync your cart to your account.
          </p>
        </div>

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
