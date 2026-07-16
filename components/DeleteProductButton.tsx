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
      className="text-ash hover:text-red-600 transition-colors p-1"
      title="Delete product"
      onClick={(e) => {
        if (
          !window.confirm(
            `Delete "${productName}"?\n\nThis action cannot be undone.\nProducts linked with active pending orders will be deactivated/hidden instead.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 size={14} />
    </button>
  );
}