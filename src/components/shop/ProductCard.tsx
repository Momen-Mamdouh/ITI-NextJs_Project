"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type ProductView = {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
  sellerId: string;
  isActive?: boolean;
};

export function ProductCard({ product }: { product: ProductView }) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [wishPending, setWishPending] = useState(false);
  const image = product.images[0] || "";
  const canAdd = product.stock > 0;
  const inWishlist = isInWishlist(product._id);

  const line = items.find((i) => i.productId === product._id);
  const qty = line?.quantity ?? 0;
  const inCart = qty > 0;
  const atMax = qty >= product.stock;

  function doAdd() {
    if (!canAdd) {
      toast.error("This product is out of stock");
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
      image,
      sellerId: String(product.sellerId),
    });
    toast.success("Added to cart");
  }

  function doRemove() {
    if (qty <= 1) {
      removeItem(product._id);
    } else {
      updateQuantity(product._id, qty - 1);
    }
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
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-muted">
        {image ? (
          image.startsWith("http") && !image.includes("cloudinary.com") ? (
            <img
              src={image}
              alt={product.name}
              className="object-cover"
              width={200}
              height={200}
            />
          ) : (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <Badge className="absolute inset-s-2 top-2 z-10" variant="secondary">
          {product.category}
        </Badge>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="absolute inset-e-2 top-2 z-10 size-9 rounded-full shadow-sm"
          disabled={wishPending}
          onClick={(e) => {
            e.preventDefault();
            void doWishlistToggle();
          }}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={inWishlist}
        >
          <Heart
            className={cn("size-4", inWishlist && "fill-red-500 text-red-500")}
          />
        </Button>
      </div>
      <CardHeader className="space-y-1 p-3 pb-0">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-snug">
          {product.name}
        </h3>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base font-bold">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        {!inCart ? (
          <Button
            type="button"
            className="mt-3 w-full"
            size="sm"
            disabled={!canAdd}
            onClick={doAdd}
          >
            <ShoppingBag className="size-4" />
            Add to cart
          </Button>
        ) : (
          <div className="mt-3 flex w-full items-center justify-center gap-0 rounded-lg border border-border bg-muted/50 p-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              onClick={doRemove}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </Button>
            <span className="min-w-10 text-center text-sm font-semibold tabular-nums">
              {qty}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              disabled={!canAdd || atMax}
              onClick={doAdd}
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        )}
        {inCart && !canAdd && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            You have all available stock in your cart
          </p>
        )}
      </CardContent>
    </Card>
  );
}
