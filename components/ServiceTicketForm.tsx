"use client";
import { useState } from "react";
import { bookServiceTicket } from "@/app/actions/maintenance";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wrench, ChevronDown } from "lucide-react";

export default function ServiceTicketForm({ equipmentId }: { equipmentId: string }) {
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!issue.trim()) return;
    setLoading(true);
    try {
      await bookServiceTicket(equipmentId, issue);
      setSubmitted(true);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <p className="text-xs text-green-700 flex items-center gap-1.5">
        ✓ Service request submitted — we'll be in touch within 1 business day.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-ash hover:text-char transition-colors"
      >
        <Wrench size={12} />
        Book a service or report an issue
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <Textarea
            required
            placeholder="Describe the issue or service needed..."
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              size="sm"
              className="bg-ember hover:bg-ember-dark"
            >
              {loading ? "Submitting..." : "Submit request"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}