"use client";
import { Star } from "lucide-react";

export function StarDisplay({
  rating,
  size = 16,
  showNumber = false,
  count,
}: {
  rating: number;
  size?: number;
  showNumber?: boolean;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            strokeWidth={1.5}
            className={
              star <= Math.round(rating)
                ? "fill-ember text-ember"
                : "fill-none text-gray-300"
            }
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm text-ash">
          {rating.toFixed(1)}
          {count !== undefined && (
            <span className="ml-1">({count})</span>
          )}
        </span>
      )}
    </div>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            size={28}
            strokeWidth={1.5}
            className={
              star <= value
                ? "fill-ember text-ember"
                : "fill-none text-gray-300 hover:text-ember/50"
            }
          />
        </button>
      ))}
    </div>
  );
}