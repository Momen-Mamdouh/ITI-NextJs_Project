"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ReviewForm } from "@/features/user/components/ReviewForm";
import { deleteReview } from "@/features/user/actions";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: string;
  tags?: string[];
  images: string[];
  sellerId: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
}

interface Review {
  _id: string;
  userId: { _id: string; name: string } | null;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase?: boolean;
  createdAt: string;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const iconClass = size === "md" ? "size-5" : "size-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            iconClass,
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

export function ProductDetailClient({
  product,
  reviews,
}: {
  product: Product;
  reviews: Review[];
}) {
  const { items, addItem, updateQuantity, removeItem, user } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [wishPending, setWishPending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const router = useRouter();

  const line = items.find((i) => i.productId === product._id);
  const qty = line?.quantity ?? 0;
  const inCart = qty > 0;
  const remaining = product.stock - qty;
  const atMax = qty >= product.stock;
  const canAdd = product.stock > 0;
  const inWishlist = isInWishlist(product._id);
  const image = product.images[selectedImage] || product.images[0] || "";
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const canReview = Boolean(user && user.role === "customer");
  const myReview =
    canReview && user
      ? reviews.find((r) => r.userId?._id === user.id) || null
      : null;

  function doAdd() {
    if (!canAdd) {
      toast.error("Out of stock");
      return;
    }
    if (inCart) {
      if (atMax) {
        toast.message("No more stock available");
        return;
      }
      updateQuantity(product._id, Math.min(product.stock, qty + 1));
      return;
    }
    addItem({
      productId: product._id,
      quantity: 1,
      price: product.price,
      name: product.name,
      image: product.images[0] || "",
      sellerId: String(product.sellerId),
    });
    toast.success("Added to cart");
  }

  function doRemove() {
    if (qty <= 1) removeItem(product._id);
    else updateQuantity(product._id, qty - 1);
  }

  async function doWishlistToggle() {
    if (wishPending) return;
    const wasIn = inWishlist;
    setWishPending(true);
    try {
      const res = await toggleWishlist(product._id);
      if (!res.success) {
        toast.error("Could not update wishlist");
        return;
      }
      toast.success(wasIn ? "Removed from wishlist" : "Saved to wishlist");
    } finally {
      setWishPending(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to shop
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
              {image ? (
                image.startsWith("http") && !image.includes("cloudinary.com") ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                )
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute left-3 top-3" variant="destructive">
                  -{discount}%
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="absolute right-3 top-3">Featured</Badge>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                      i === selectedImage
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/30",
                    )}
                  >
                    {img.startsWith("http") && !img.includes("cloudinary.com") ? (
                      <img
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-5">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {product.name}
              </h1>
              {product.rating != null && product.rating > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={product.rating} size="md" />
                  <span className="text-sm font-medium">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount ?? 0} review{(product.reviewCount ?? 0) !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <Separator />

            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-semibold",
                  remaining <= 0
                    ? "text-destructive"
                    : remaining <= 3
                      ? "text-amber-600"
                      : "text-green-600",
                )}
              >
                {remaining > 0
                  ? `${remaining} in stock`
                  : inCart
                    ? "All in your cart"
                    : "Out of stock"}
              </span>
              {inCart && remaining > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({qty} in cart)
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {!inCart ? (
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!canAdd}
                  onClick={doAdd}
                >
                  <ShoppingBag className="size-5" />
                  Add to cart
                </Button>
              ) : (
                <div className="flex items-center gap-0 rounded-lg border border-border bg-muted/50 p-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={doRemove}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="min-w-12 text-center text-sm font-semibold tabular-nums">
                    {qty}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={!canAdd || atMax}
                    onClick={doAdd}
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                size="lg"
                disabled={wishPending}
                onClick={() => void doWishlistToggle()}
              >
                <Heart
                  className={cn(
                    "size-5",
                    inWishlist && "fill-red-500 text-red-500",
                  )}
                />
                {inWishlist ? "Saved" : "Save"}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Truck className="size-5 shrink-0 text-muted-foreground" />
                <div className="text-xs">
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Shield className="size-5 shrink-0 text-muted-foreground" />
                <div className="text-xs">
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-muted-foreground">Stripe & COD</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <RotateCcw className="size-5 shrink-0 text-muted-foreground" />
                <div className="text-xs">
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-muted-foreground">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              Customer Reviews
              {reviews.length > 0 && (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({reviews.length})
                </span>
              )}
            </h2>

            {canReview ? (
              <div className="flex items-center gap-2">
                {myReview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const res = await deleteReview(myReview._id);
                      if (res.success) {
                        toast.success("Review deleted");
                        router.refresh();
                      } else {
                        toast.error(res.error || "Failed to delete review");
                      }
                    }}
                  >
                    Delete my review
                  </Button>
                )}

                <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                  <DialogTrigger
                    render={
                      <Button type="button">
                        {myReview ? "Edit my review" : "Write a review"}
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {myReview ? "Edit your review" : "Write a review"}
                      </DialogTitle>
                    </DialogHeader>
                    <ReviewForm
                      productId={product._id}
                      reviewId={myReview?._id}
                      initialValues={
                        myReview
                          ? {
                              rating: myReview.rating,
                              title: myReview.title,
                              comment: myReview.comment,
                            }
                          : undefined
                      }
                      onDone={() => setReviewOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <Link
                href={`/auth/login?next=${encodeURIComponent(`/product/${product._id}`)}`}
                className="text-sm text-primary underline underline-offset-4"
              >
                Sign in to write a review
              </Link>
            )}
          </div>

          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="mx-auto mb-3 size-8 text-muted-foreground/30" />
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to review this product!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review._id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">
                          {review.title || "Review"}
                        </CardTitle>
                        <div className="mt-1 flex items-center gap-2">
                          <StarRating rating={review.rating} />
                          <span className="text-xs text-muted-foreground">
                            by {review.userId?.name || "Anonymous"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {review.isVerifiedPurchase && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en-US")}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  {review.comment && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
