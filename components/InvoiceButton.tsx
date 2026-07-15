"use client";
import { useState } from "react";
import { generateAndStoreInvoice } from "@/app/actions/invoices";
import { FileText, Loader2, Download } from "lucide-react";

export default function InvoiceButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const invoice = await generateAndStoreInvoice(orderId);
      if (invoice.pdfUrl) {
        setUrl(invoice.pdfUrl);
        window.open(invoice.pdfUrl, "_blank");
      }
    } finally {
      setLoading(false);
    }
  }

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-ember hover:underline mb-6"
      >
        <Download size={14} /> Download invoice (PDF)
      </a>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm text-ash hover:text-ember transition-colors mb-6"
    >
      {loading ? (
        <><Loader2 size={14} className="animate-spin" /> Generating invoice...</>
      ) : (
        <><FileText size={14} /> Download invoice (PDF)</>
      )}
    </button>
  );
}