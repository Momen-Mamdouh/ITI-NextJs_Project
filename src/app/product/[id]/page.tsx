import { notFound } from "next/navigation";
import {
  fetchProductById,
  fetchProductReviews,
} from "@/features/products/product-actions";
import { ProductDetailClient } from "@/components/shop/ProductDetail";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const productRes = await fetchProductById(id);
  if (!productRes.success || !productRes.data) {
    return { title: "Product" };
  }
  return { title: productRes.data.name || "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [productRes, reviewsRes] = await Promise.all([
    fetchProductById(id),
    fetchProductReviews(id),
  ]);

  if (!productRes.success || !productRes.data) notFound();

  const product = productRes.data;
  const reviews = reviewsRes.success ? reviewsRes.data : [];

  return <ProductDetailClient product={product} reviews={reviews} />;
}
