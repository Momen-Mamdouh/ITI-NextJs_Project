import {
  fetchProducts,
  fetchProductCategoryNames,
} from "@/features/products/product-actions";
import { fetchActiveCategoryNames } from "@/features/category/category-actions";
import { ProductTable } from "@/features/admin/components/ProductTable";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SellerModel from "@/features/seller/models/seller.model";

function mergeCategoryNames(
  a: string[] | undefined,
  b: string[] | undefined,
): { name: string }[] {
  const set = new Set<string>([...(a ?? []), ...(b ?? [])]);
  return [...set].sort((x, y) => x.localeCompare(y)).map((name) => ({ name }));
}

export default async function AdminProductsPage() {
  const session = await requireAuth(["admin", "seller"]);
  await dbConnect();

  let sellerMongoId: string | undefined;
  if (session.role === "seller") {
    const seller = await SellerModel.findOne({ userId: session.id })
      .select("_id")
      .lean();
    sellerMongoId = seller?._id.toString();
  }

  const [productsResult, activeCats, productCats] = await Promise.all([
    fetchProducts({
      sellerId: sellerMongoId,
    }),
    fetchActiveCategoryNames(),
    fetchProductCategoryNames(),
  ]);

  if (!productsResult.success)
    return <div className="p-6 text-destructive">Error loading products</div>;

  const categoryOptions = mergeCategoryNames(
    activeCats.success ? activeCats.names : [],
    productCats.success ? productCats.names : [],
  );

  let adminSellers: { id: string; label: string }[] | undefined;
  if (session.role === "admin") {
    const sellers = await SellerModel.find({})
      .select("storeName")
      .sort({ storeName: 1 })
      .lean();
    adminSellers = sellers.map((s) => ({
      id: String(s._id),
      label: String(s.storeName),
    }));
  }

  return (
    <ProductTable
      products={JSON.parse(JSON.stringify(productsResult.data || []))}
      categoryOptions={categoryOptions}
      sessionRole={session.role === "admin" ? "admin" : "seller"}
      adminSellers={adminSellers}
    />
  );
}
