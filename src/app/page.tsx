import { fetchProducts } from "@/features/products/product-actions";
import { ProductCard, type ProductView } from "@/components/shop/ProductCard";

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

export default async function Home() {
  const res = await fetchProducts();
  const raw = res.success && res.data ? res.data : [];
  const products: ProductView[] = JSON.parse(JSON.stringify(raw)).map(toView);

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Shop
          </h1>
          <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground">
            Browse products and add them to your cart. Guests check out on the
            cart page; sign in to sync your cart to your account.
          </p>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No products yet. Add some from the seller or admin area.
          </p>
        ) : (
          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
