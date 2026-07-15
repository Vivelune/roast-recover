"use client";
import { useState } from "react";
import { inviteMember } from "@/app/actions/company";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus, AlertCircle } from "lucide-react";

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
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Failed to invite member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-char mb-4 flex items-center gap-2">
        <UserPlus size={15} /> Invite team member
      </p>
      <form onSubmit={handleInvite} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Email address</Label>
            <Input
              required
              type="email"
              placeholder="manager@café.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input
              placeholder="e.g. Downtown, Austin TX"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Role</Label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ember"
          >
            <option value="MANAGER">Manager — can place orders</option>
            <option value="VIEWER">Viewer — read only</option>
          </select>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            <AlertCircle size={13} /> {error}
          </div>
        )}
        {success && (
          <p className="text-sm text-green-700">Member added successfully.</p>
        )}
        <Button type="submit" disabled={loading} className="bg-ember hover:bg-ember-dark">
          {loading ? "Adding..." : "Add team member"}
        </Button>
        <p className="text-xs text-ash">
          They must have a Roast & Recover account. Share the link to sign up if needed.
        </p>
      </form>
    </Card>
  );
}