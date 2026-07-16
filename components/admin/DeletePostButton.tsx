"use client";

import { Trash2 } from "lucide-react";

export default function DeletePostButton() {
  return (
    <button
      type="submit"
      className="text-ash hover:text-red-500 transition-colors shrink-0 h-8 w-8 inline-flex items-center justify-center border border-transparent hover:border-red-100 hover:bg-red-50 rounded-lg"
      onClick={(e) => {
        if (!confirm("Are you sure you want to delete this post?")) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 size={13} />
    </button>
  );
}