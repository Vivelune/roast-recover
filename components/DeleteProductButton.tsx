"use client";

import { Trash2 } from "lucide-react";

export default function DeleteProductButton({
  productName,
}: {
  productName: string;
}) {
  return (
    <button
      type="submit"
      className="text-ash hover:text-red-500 transition-colors"
      onClick={(e) => {
        if (
          !window.confirm(
            `Delete "${productName}"?\n\nThis cannot be undone.\nProducts with active orders will be hidden instead.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 size={13} />
    </button>
  );
}