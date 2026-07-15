"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReferralShareButton({
  url,
  code,
}: {
  url: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      className="flex-shrink-0 gap-1.5"
    >
      {copied ? (
        <><Check size={14} className="text-green-600" /> Copied</>
      ) : (
        <><Copy size={14} /> Copy link</>
      )}
    </Button>
  );
}