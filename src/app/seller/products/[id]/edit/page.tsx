import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { fetchActiveCategoryNames } from "@/features/category/category-actions";
import { fetchSellerProductById } from "@/features/seller/seller-product-actions";
import { SellerProductEditClient } from "@/features/seller/components/SellerProductEditClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit product",
};

export default async function SellerProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth(["seller"]);
  await dbConnect();

  const { id } = await params;

  const [productRes, categoriesRes] = await Promise.all([
    fetchSellerProductById(id),
    fetchActiveCategoryNames(),
  ]);

  if (!productRes.success) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <SellerProductEditClient
        product={productRes.data}
        categoryOptions={(categoriesRes.names || []).map((name) => ({ name }))}
      />
    </main>
  );
}

