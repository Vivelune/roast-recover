"use client";
import { useState } from "react";
import { submitLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactForm({ productId }: { productId?: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
    interest: "equipment",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await submitLead({ ...form, productId });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-4">
          <CheckCircle2 size={22} />
        </div>
        <p className="font-display font-semibold text-xl text-char mb-2">
          Message sent
        </p>
        <p className="text-ash text-sm leading-relaxed">
          We've received your enquiry and sent a confirmation to{" "}
          <span className="text-char font-medium">{form.email}</span>.
          Expect a reply within 1 business day.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@café.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="company">
              Company <span className="text-ash text-xs">(optional)</span>
            </Label>
            <Input
              id="company"
              placeholder="Café name"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Phone <span className="text-ash text-xs">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="interest">I'm interested in</Label>
          <select
            id="interest"
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
            className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white text-char focus:outline-none focus:ring-1 focus:ring-ember"
          >
            <option value="equipment">Equipment (machines, grinders)</option>
            <option value="packaging">Packaging (cups, lids, bags)</option>
            <option value="both">Both equipment and packaging</option>
            <option value="custom">Custom / bulk order</option>
            <option value="other">Something else</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            required
            placeholder="Tell us what you need — volume, specifications, timeline, questions about the deposit model, anything..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={5}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2.5">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-ember hover:bg-ember-dark"
        >
          {loading ? "Sending..." : "Send message"}
        </Button>

        <p className="text-xs text-ash text-center">
          We respond within 1 business day. No spam, ever.
        </p>
      </form>
    </Card>
  );
}