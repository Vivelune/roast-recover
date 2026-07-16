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
      <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3.5 text-xs font-semibold leading-normal">
        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Review submitted!</p>
          <p className="font-normal text-[11px] text-emerald-700/90 mt-0.5">Thank you for helping other café operators.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-char">Your rating</Label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-title" className="text-xs font-semibold text-char">Title (optional)</Label>
        <Input
          id="review-title"
          placeholder="Summarize your experience..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="h-10 border-gray-200 focus-visible:ring-ember bg-white text-char placeholder:text-ash text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-body" className="text-xs font-semibold text-char">Review description</Label>
        <Textarea
          id="review-body"
          required
          placeholder="What should other café operators know about this model?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={1000}
          className="border-gray-200 focus-visible:ring-ember bg-white text-char text-xs"
        />
        <p className="text-[10px] text-ash text-right">{body.length}/1000</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
          <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full text-white bg-ember hover:bg-ember-dark h-10 text-xs uppercase tracking-wider font-bold transition-all rounded-xl"
      >
        {loading
          ? "Submitting..."
          : existingReview
          ? "Update Review"
          : "Submit Review"}
      </Button>
    </form>
  );
}