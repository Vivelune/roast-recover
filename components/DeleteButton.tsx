"use client";

import { Button } from "@/components/ui/button";

export function DeleteCertificationButton() {
  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      className="text-red-500"
      onClick={(e) => {
        if (
          !window.confirm(
            "Delete this certification? Products linked to it will be unlinked."
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      Delete
    </Button>
  );
}