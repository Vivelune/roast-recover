import { StarDisplay } from "./StarRating";
import { ShieldCheck } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  createdAt: Date;
  user: { name: string | null; email: string };
};

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-ash text-sm py-8 text-center">
        No reviews yet — be the first to share your experience.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((r) => (
        <div key={r.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <StarDisplay rating={r.rating} size={14} />
              {r.title && (
                <p className="font-medium text-char text-sm mt-1">{r.title}</p>
              )}
            </div>
            <p className="text-xs text-ash flex-shrink-0">
              {new Date(r.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <p className="text-sm text-ash leading-relaxed mb-2">{r.body}</p>
          <div className="flex items-center gap-3">
            <p className="text-xs text-ash">
              {r.user.name ?? r.user.email.split("@")[0]}
            </p>
            {r.verified && (
              <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <ShieldCheck size={11} />
                Verified purchase
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}