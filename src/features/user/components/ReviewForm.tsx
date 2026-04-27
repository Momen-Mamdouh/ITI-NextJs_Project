"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ReviewSchema } from "@/features/user/schemas";
import { createReview } from "@/features/user/actions";
import { toast } from "sonner";

type ReviewValues = z.infer<typeof ReviewSchema>;

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onDone?: () => void;
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={`size-6 transition-colors ${
                star <= (hover || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function ReviewForm({ productId, orderId, onDone }: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ReviewValues>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      productId,
      orderId: orderId || undefined,
      rating: 0,
      title: "",
      comment: "",
    },
  });

  async function onSubmit(values: ReviewValues) {
    if (values.rating === 0) {
      form.setError("rating", { message: "Please select a rating" });
      return;
    }
    setLoading(true);
    const result = await createReview(values);
    if (result.success) {
      toast.success("Review submitted");
      router.refresh();
      onDone?.();
    } else {
      toast.error(result.error || "Failed to submit review");
    }
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({
            field,
          }: {
            field: ControllerRenderProps<ReviewValues, "rating">;
          }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <StarInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({
            field,
          }: {
            field: ControllerRenderProps<ReviewValues, "title">;
          }) => (
            <FormItem>
              <FormLabel>Title (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Summarize your review..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({
            field,
          }: {
            field: ControllerRenderProps<ReviewValues, "comment">;
          }) => (
            <FormItem>
              <FormLabel>Comment (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience with this product..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
          {onDone && (
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
