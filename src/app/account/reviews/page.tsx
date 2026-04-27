import { getUserReviews } from "@/features/user/actions";
import { ReviewCard } from "@/features/user/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import Link from "next/link";

interface ReviewsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const result = await getUserReviews(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Reviews</h1>
        <p className="text-sm text-muted-foreground">
          {result.pagination.total} review(s) written
        </p>
      </div>

      {result.reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
          <Star className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No reviews yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Purchase a product and share your experience
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {result.reviews.map(
            (review: {
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
            }) => (
              <ReviewCard key={review._id} review={review} />
            ),
          )}
        </div>
      )}

      {result.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {result.pagination.page} of {result.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            {result.pagination.page > 1 && (
              <Link
                href={`/account/reviews?page=${result.pagination.page - 1}`}
              >
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {result.pagination.page < result.pagination.totalPages && (
              <Link
                href={`/account/reviews?page=${result.pagination.page + 1}`}
              >
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
