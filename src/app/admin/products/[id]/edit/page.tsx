import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import SellerModel from "@/features/seller/models/seller.model";
import { fetchActiveCategoryNames } from "@/features/category/category-actions";
import { fetchProductById, fetchProductCategoryNames } from "@/features/products/product-actions";
import { ProductEditClient } from "@/features/admin/components/ProductEditClient";

function mergeCategoryNames(
  a: string[] | undefined,
  b: string[] | undefined,
): { name: string }[] {
  const set = new Set([...(a ?? []), ...(b ?? [])]);
  return [...set].sort((x, y) => x.localeCompare(y)).map((name) => ({ name }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const session = await requireAuth(["admin"]);
  await dbConnect();

  const [productRes, activeCats, productCats, sellers] = await Promise.all([
    fetchProductById(id),
    fetchActiveCategoryNames(),
    fetchProductCategoryNames(),
    SellerModel.find({}).select("storeName").sort({ storeName: 1 }).lean(),
  ]);

  if (!productRes.success || !productRes.data) notFound();

  const categoryOptions = mergeCategoryNames(
    activeCats.success ? activeCats.names : [],
    productCats.success ? productCats.names : [],
  );

  const adminSellers = sellers.map((s) => ({
    id: s._id?.toString() || "",
    label: String((s as { storeName?: unknown }).storeName ?? ""),
  }));

  const p = productRes.data as unknown as {
    _id: string;
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    category: string;
    images: string[];
    isActive?: boolean;
  };

  return (
    <ProductEditClient
      sessionRole={session.role === "admin" ? "admin" : "seller"}
      product={p}
      categoryOptions={categoryOptions}
      adminSellers={adminSellers}
    />
  );
}

