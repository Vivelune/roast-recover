// app/admin/outreach/leads/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Eye, MousePointerClick, Clock, Plus, Loader2 } from "lucide-react";

interface EmailEvent {
  id: string;
  type: "OPEN" | "CLICK";
  timestamp: string;
}

interface ScheduledEmail {
  id: string;
  subject: string;
  body: string;
  status: string;
  scheduledAt: string;
  sentAt: string | null;
  parentEmailId: string | null;
  events: EmailEvent[];
}

interface LeadDetail {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  status: string;
  scheduledEmails: ScheduledEmail[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-steam text-ash",
  SENT: "bg-blue-50 text-blue-700",
  FAILED: "bg-red-50 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function LeadDetailPage() {
  const params = useParams();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [showFollowUpFor, setShowFollowUpFor] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [delayDays, setDelayDays] = useState("3");
  const [saving, setSaving] = useState(false);
  const [markingReplied, setMarkingReplied] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/outreach/leads/${params.id}/timeline`);
    const data = await res.json();
    setLead(data.lead);
  }

  useEffect(() => {
    load();
  }, [params.id]);

  async function handleAddFollowUp(parentEmailId: string) {
    setSaving(true);
    await fetch("/api/admin/outreach/follow-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentEmailId,
        subject,
        body,
        delayDays: Number(delayDays),
      }),
    });
    setSaving(false);
    setShowFollowUpFor(null);
    setSubject("");
    setBody("");
    load();
  }
  async function handleMarkReplied() {
    setMarkingReplied(true);
    await fetch(`/api/admin/outreach/leads/${lead!.id}/mark-replied`, {
      method: "POST",
    });
    setMarkingReplied(false);
    load(); // refresh so status badge + cancelled follow-ups reflect immediately
  }

  if (!lead) return <p className="text-sm text-ash">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
          {lead.company ?? lead.email}
        </h1>
        <p className="text-xs sm:text-sm text-ash mt-1">{lead.email}</p>
        <Badge className="mt-2 border-0">{lead.status}</Badge>
        {lead.status !== "REPLIED" && lead.status !== "UNSUBSCRIBED" && (
      <button
        onClick={handleMarkReplied}
        disabled={markingReplied}
        className="text-[11px] font-semibold text-ember hover:underline disabled:opacity-50"
      >
        {markingReplied ? "Marking..." : "Mark as replied"}
      </button>
    )}
      </div>

      <div className="space-y-4">
        {lead.scheduledEmails.map((email) => {
          const opens = email.events.filter((e) => e.type === "OPEN").length;
          const clicks = email.events.filter((e) => e.type === "CLICK").length;

          return (
            <Card key={email.id} className="p-5 border-gray-150">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-steam/40 text-ash">
                      <Mail size={13} />
                    </div>
                    <p className="text-sm font-semibold text-char">{email.subject}</p>
                    {email.parentEmailId && (
                      <Badge variant="outline" className="text-[10px]">
                        Follow-up
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-ash mt-1.5 whitespace-pre-line">
                    {email.body.slice(0, 140)}
                    {email.body.length > 140 ? "..." : ""}
                  </p>
                </div>
                <Badge className={`${statusColors[email.status]} border-0 text-[10px] font-bold whitespace-nowrap`}>
                  {email.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-[11px] text-ash">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {email.sentAt
                    ? `Sent ${new Date(email.sentAt).toLocaleString()}`
                    : `Scheduled ${new Date(email.scheduledAt).toLocaleString()}`}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {opens} opens
                </span>
                <span className="flex items-center gap-1">
                  <MousePointerClick size={12} /> {clicks} clicks
                </span>
              </div>

              {email.status === "SENT" && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {showFollowUpFor === email.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-semibold text-char">Subject</Label>
                        <Input
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-char">Body</Label>
                        <Textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          rows={5}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-char">Send after (days)</Label>
                        <Input
                          type="number"
                          value={delayDays}
                          onChange={(e) => setDelayDays(e.target.value)}
                          className="mt-1.5 w-24"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddFollowUp(email.id)}
                          disabled={saving || !subject || !body}
                          className="bg-ember hover:opacity-90"
                        >
                          {saving ? <Loader2 size={12} className="animate-spin" /> : "Schedule follow-up"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowFollowUpFor(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowFollowUpFor(email.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-ember hover:underline"
                    >
                      <Plus size={13} /> Add follow-up
                    </button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}