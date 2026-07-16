"use client";

import { useState } from "react";
import { inviteMember } from "@/app/actions/company";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function CompanyClient({ companyId }: { companyId: string }) {
  const [form, setForm] = useState({ email: "", role: "MANAGER", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await inviteMember(companyId, form.email, form.role as any, form.location || undefined);
      setSuccess(true);
      setForm({ email: "", role: "MANAGER", location: "" });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message ?? "Failed to invite member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
      <p className="text-xs font-bold uppercase tracking-wider text-[#B5481F] mb-5 flex items-center gap-2">
        <UserPlus size={14} /> Invite New Team Member
      </p>
      
      <form onSubmit={handleInvite} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-char">Email Address</Label>
            <Input
              required
              type="email"
              placeholder="manager@cafe.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-char">Assigned Location</Label>
            <Input
              placeholder="e.g. Downtown, Austin TX"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-xl border-gray-200 focus-visible:ring-[#B5481F] text-xs h-10"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-char">Role Assignment</Label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold bg-white text-char focus:outline-none focus:ring-1 focus:ring-[#B5481F] h-10"
          >
            <option value="MANAGER">Manager — can configure and place orders</option>
            <option value="VIEWER">Viewer — clear read-only data mapping visibility</option>
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50/60 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={14} className="shrink-0 text-red-500" /> {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50/60 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle2 size={14} className="shrink-0 text-green-600" /> Member registration synchronized successfully.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <Button 
            type="submit" 
            disabled={loading} 
            className="bg-[#B5481F] hover:bg-[#9E3E1A] text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs transition-colors order-last sm:order-first self-start sm:self-auto"
          >
            {loading ? "Adding..." : "Add team member"}
          </Button>
          <p className="text-[11px] text-ash font-medium leading-normal max-w-sm">
            Invited users must have an existing profile. Ensure they register their Roast &amp; Recover account coordinates before allocation.
          </p>
        </div>
      </form>
    </Card>
  );
}