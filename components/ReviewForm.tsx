"use client";
import { useState } from "react";
import { submitReview } from "@/app/actions/reviews";
import { StarPicker } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ReviewForm({
  productId,
  slug,
  category,
  existingReview,
}: {
  productId: string;
  slug: string;
  category: string;
  existingReview?: { rating: number; title: string | null; body: string } | null;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await submitReview({ productId, rating, title, body, slug, category });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
        <CheckCircle2 size={16} />
        Review submitted — thank you!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2 block">Your rating</Label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input
          id="review-title"
          placeholder="Summarise your experience..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-body">Review</Label>
        <Textarea
          id="review-body"
          required
          placeholder="Tell other café operators what you think..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-ash text-right">{body.length}/1000</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2.5">
          <AlertCircle size={13} /> {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="bg-ember hover:bg-ember-dark"
      >
        {loading
          ? "Submitting..."
          : existingReview
          ? "Update review"
          : "Submit review"}
      </Button>
    </form>
  );
}