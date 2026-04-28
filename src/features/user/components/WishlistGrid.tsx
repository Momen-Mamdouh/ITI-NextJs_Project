"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleWishlist } from "@/features/user/actions";
import { toast } from "sonner";

interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  stock: number;
}

interface WishlistGridProps {
  items: WishlistProduct[];
}

export function WishlistGrid({ items }: WishlistGridProps) {
  const [removing, setRemoving] = useState<string | null>(null);
  const router = useRouter();

  async function handleRemove(productId: string) {
    setRemoving(productId);
    const result = await toggleWishlist(productId);
    if (result.success) {
      toast.success("Removed from wishlist");
      router.refresh();
    } else {
      toast.error("Failed to remove");
    }
    setRemoving(null);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
        <Heart className="size-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Your wishlist is empty</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Browse products and add your favorites here
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item._id} className="overflow-hidden">
          <div className="relative aspect-square bg-muted">
            {item.images[0] ? (
              <Image
                src={item.images[0]}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ShoppingCart className="size-8" />
              </div>
            )}
            <Button
              size="icon-sm"
              variant="destructive"
              className="absolute top-2 right-2"
              disabled={removing === item._id}
              onClick={() => handleRemove(item._id)}
            >
              <Heart className="size-4 fill-current" />
            </Button>
          </div>
          <CardContent className="p-4 space-y-2">
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
            <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-yellow-400 text-yellow-400" />
              <span>{item.rating.toFixed(1)}</span>
              <span>({item.reviewCount})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                ${item.price.toFixed(2)}
              </span>
              {item.stock === 0 && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
