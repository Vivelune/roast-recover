// app/admin/outreach/compose/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Users } from "lucide-react";

interface Lead {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  status: string;
}

interface SendResult {
  sent: number;
  failed: number;
}

interface ApiResult {
  leadId?: string;
  email?: string;
  status?: "sent" | "failed";
  error?: string;
  resendId?: string;
}

interface SendResponse {
  results?: ApiResult[];
  error?: string;
}

export default function ComposePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
const [scheduledAt, setScheduledAt] = useState("");



  useEffect(() => {
    fetch("/api/admin/outreach/leads")
      .then(async (r) => {
        const data = await r.json();

        if (!r.ok) {
          throw new Error(data.error || "Failed to load leads");
        }

        return data;
      })
      .then((data) => setLeads(data.leads ?? []))
      .catch((err) => {
        console.error("Failed to load leads:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load leads"
        );
      });
  }, []);

  function toggleLead(id: string) {
    const next = new Set(selected);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setSelected(next);
  }


async function handleSend() {
  // Basic validation
  if (selected.size === 0) {
    setError("Please select at least one lead.");
    return;
  }

  if (!subject.trim()) {
    setError("Please enter a subject.");
    return;
  }

  if (!body.trim()) {
    setError("Please enter an email body.");
    return;
  }

  // Scheduling validation
  if (sendMode === "schedule" && !scheduledAt) {
    setError("Please select a date and time to schedule the emails.");
    return;
  }

  setSending(true);
  setResult(null);
  setError(null);

  try {
    // Choose the correct API endpoint
    const endpoint =
      sendMode === "now"
        ? "/api/admin/outreach/send"
        : "/api/admin/outreach/schedule";

    // Build the appropriate payload
    const payload =
    sendMode === "now"
    ? { leadIds: Array.from(selected), subject, body }
    : {
        leadIds: Array.from(selected),
        subject,
        body,
        scheduledAt: new Date(scheduledAt).toISOString(), // convert local -> true UTC here
      };
      
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // Handle HTTP errors from either endpoint
    if (!res.ok) {
      console.error("Outreach API error:", data);

      setError(
        data.error ||
          `Failed to ${
            sendMode === "now" ? "send" : "schedule"
          } emails (HTTP ${res.status})`
      );

      return;
    }

    // -----------------------------------------
    // SEND NOW
    // -----------------------------------------
    if (sendMode === "now") {
      const results = Array.isArray(data.results)
        ? data.results
        : [];

      const sent = results.filter(
        (r: any) => r.status === "sent"
      ).length;

      const failed = results.filter(
        (r: any) => r.status === "failed"
      ).length;

      setResult({
        sent,
        failed,
      });

      // Log individual failures for debugging
      const failedResults = results.filter(
        (r: any) => r.status === "failed"
      );

      if (failedResults.length > 0) {
        console.warn(
          "Some emails failed:",
          failedResults
        );
      }
    }

    // -----------------------------------------
    // SCHEDULE
    // -----------------------------------------
    else {
      const scheduled = Number(data.scheduled ?? 0);

      setResult({
        sent: scheduled,
        failed: 0,
      });
    }

    // Clear selected leads after successful API response
    setSelected(new Set());
  } catch (err) {
    console.error("Outreach request failed:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong while processing the emails."
    );
  } finally {
    setSending(false);
  }
}



  

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-char">
          Compose Email
        </h1>

        <p className="text-sm text-ash mt-1">
          Select leads and send a personalized email.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Unable to send</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead selection */}
        <Card className="p-5 border-gray-150">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-steam/40 text-ash">
              <Users size={16} />
            </div>

            <p className="text-sm font-semibold text-char">
              Select leads ({selected.size} selected)
            </p>
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto">
            {leads.map((lead) => (
              <label
                key={lead.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-steam/20 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(lead.id)}
                    onChange={() => toggleLead(lead.id)}
                    className="accent-ember"
                  />

                  <div>
                    <p className="text-sm font-medium text-char">
                      {lead.company ?? lead.email}
                    </p>

                    <p className="text-[11px] text-ash">
                      {lead.email}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="text-[10px]"
                >
                  {lead.status}
                </Badge>
              </label>
            ))}

            {leads.length === 0 && (
              <p className="text-sm text-ash text-center py-8">
                No leads found.
              </p>
            )}
          </div>
        </Card>

        {/* Compose form */}
        <Card className="p-5 border-gray-150 space-y-4">
          <div>
            <Label
              htmlFor="subject"
              className="text-xs font-semibold text-char"
            >
              Subject
            </Label>

            <Input
              id="subject"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              placeholder="Quick equipment pricing check for {{company}}"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label
              htmlFor="body"
              className="text-xs font-semibold text-char"
            >
              Body
            </Label>

            <Textarea
              id="body"
              value={body}
              onChange={(e) =>
                setBody(e.target.value)
              }
              rows={10}
              placeholder="Hi {{name}}, ..."
              className="mt-1.5"
            />

            <p className="text-[11px] text-ash/80 mt-1.5">
              Use {"{{name}}"} and {"{{company}}"} to personalize
            </p>
          </div>

       
{/* Send mode toggle */}
<div className="flex gap-2">
  <button
    type="button"
    onClick={() => setSendMode("now")}
    className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors ${
      sendMode === "now"
        ? "bg-ember text-white border-ember"
        : "bg-white text-ash border-gray-200"
    }`}
  >
    Send now
  </button>

  <button
    type="button"
    onClick={() => setSendMode("schedule")}
    className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors ${
      sendMode === "schedule"
        ? "bg-ember text-white border-ember"
        : "bg-white text-ash border-gray-200"
    }`}
  >
    Schedule
  </button>
</div>

{/* Scheduled date/time */}
{sendMode === "schedule" && (
  <div>
    <Label
      htmlFor="scheduledAt"
      className="text-xs font-semibold text-char"
    >
      Send at
    </Label>

    <Input
      id="scheduledAt"
      type="datetime-local"
      value={scheduledAt}
      onChange={(e) => setScheduledAt(e.target.value)}
      min={new Date().toISOString().slice(0, 16)}
      className="mt-1.5"
    />
  </div>
)}

{/* Submit button */}
<Button
  onClick={handleSend}
  disabled={
    sending ||
    selected.size === 0 ||
    !subject.trim() ||
    !body.trim() ||
    (sendMode === "schedule" && !scheduledAt)
  }
  className="w-full bg-ember hover:opacity-90 gap-1.5"
>
  {sending ? (
    <>
      <Loader2
        size={14}
        className="animate-spin"
      />
      {sendMode === "now"
        ? "Sending..."
        : "Scheduling..."}
    </>
  ) : (
    <>
      <Send size={14} />
      {sendMode === "now"
        ? `Send to ${selected.size} leads`
        : `Schedule for ${selected.size} leads`}
    </>
  )}
</Button>



          {/* Results */}
          {result && (
            <div className="text-xs sm:text-sm text-ash pt-2 border-t border-gray-100">
              Sent:{" "}
              <span className="font-semibold text-char">
                {result.sent}
              </span>

              {result.failed > 0 && (
                <>
                  {" "}
                  · Failed:{" "}
                  <span className="font-semibold text-red-600">
                    {result.failed}
                  </span>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
