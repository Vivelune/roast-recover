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
      <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-steam/5">
        <p className="text-ash text-sm">
          No reviews yet — be the first to share your experience with this equipment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((r) => (
        <div key={r.id} className="border-b border-gray-150 pb-6 last:border-0 last:pb-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <StarDisplay rating={r.rating} size={12} />
              {r.title && (
                <p className="font-semibold text-char text-sm mt-1">{r.title}</p>
              )}
            </div>
            <p className="text-xs text-ash font-medium">
              {new Date(r.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <p className="text-sm text-ash leading-relaxed mb-3">{r.body}</p>
          <div className="flex items-center gap-3">
            <p className="text-xs text-char font-semibold">
              {r.user.name ?? r.user.email.split("@")[0]}
            </p>
            {r.verified && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded">
                <ShieldCheck size={11} className="stroke-[2.5]" />
                Verified Purchase
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}