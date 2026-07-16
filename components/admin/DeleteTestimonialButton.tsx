"use client";

import { Trash2 } from "lucide-react";

export default function DeleteTestimonialButton() {
  return (
    <button
      type="submit"
      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors border border-transparent hover:border-red-100"
      onClick={(e) => {
        if (!confirm("Delete this testimonial? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 size={13} /> Delete Record
    </button>
  );
}