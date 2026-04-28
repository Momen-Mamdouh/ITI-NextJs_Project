"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteReview } from "@/features/user/actions";
import { toast } from "sonner";

interface ReviewCardProps {
  review: {
    _id: string;
    rating: number;
    title?: string;
    comment?: string;
    isVerifiedPurchase: boolean;
    createdAt: string;
    productId: {
      _id: string;
      name: string;
      images: string[];
      price: number;
    };
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteReview(review._id);
    if (result.success) {
      toast.success("Review deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete review");
    }
    setDeleting(false);
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-medium text-sm">
              {review.productId?.name || "Unknown Product"}
            </p>
            <StarRating rating={review.rating} />
          </div>
          <div className="flex items-center gap-2">
            {review.isVerifiedPurchase && (
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="size-3" />
                Verified
              </Badge>
            )}
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {review.title && (
          <p className="font-medium text-sm">{review.title}</p>
        )}
        {review.comment && (
          <p className="text-sm text-muted-foreground">{review.comment}</p>
        )}

        <p className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
