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
      <Card className="border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-10 text-center bg-white rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 mx-auto mb-5 border border-green-100">
          <CheckCircle2 size={26} />
        </div>
        <p className="font-display font-semibold text-2xl text-char mb-3 tracking-tight">
          Message sent
        </p>
        <p className="text-ash text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
          We&apos;ve received your enquiry and sent a confirmation to{" "}
          <span className="text-char font-semibold">{form.email}</span>.
          Expect a reply within 1 business day.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-8 rounded-2xl bg-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Name & Email Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-char uppercase tracking-wider block">
              Name
            </Label>
            <Input
              id="name"
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border-gray-200 focus-visible:ring-ember bg-steam/20 h-11 text-sm rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-char uppercase tracking-wider block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@café.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border-gray-200 focus-visible:ring-ember bg-steam/20 h-11 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Company & Phone Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-xs font-bold text-char uppercase tracking-wider block">
              Company <span className="text-ash font-normal normal-case">(optional)</span>
            </Label>
            <Input
              id="company"
              placeholder="Café name"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="border-gray-200 focus-visible:ring-ember bg-steam/20 h-11 text-sm rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-bold text-char uppercase tracking-wider block">
              Phone <span className="text-ash font-normal normal-case">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border-gray-200 focus-visible:ring-ember bg-steam/20 h-11 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="space-y-2">
          <Label htmlFor="interest" className="text-xs font-bold text-char uppercase tracking-wider block">
            I&apos;m interested in
          </Label>
          <div className="relative">
            <select
              id="interest"
              value={form.interest}
              onChange={(e) => setForm({ ...form, interest: e.target.value })}
              className="w-full appearance-none border border-gray-200 rounded-lg px-3.5 h-11 text-sm bg-steam/20 text-char focus:outline-none focus:ring-1 focus:ring-ember focus:border-ember transition-all pr-10 cursor-pointer"
            >
              <option value="equipment">Equipment (machines, grinders)</option>
              <option value="packaging">Packaging (cups, lids, bags)</option>
              <option value="both">Both equipment and packaging</option>
              <option value="custom">Custom / bulk order</option>
              <option value="other">Something else</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-ash">
              <svg className="fill-current h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-xs font-bold text-char uppercase tracking-wider block">
            Message
          </Label>
          <Textarea
            id="message"
            required
            placeholder="Tell us what you need — volume, specifications, timeline, questions about the deposit model, anything..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={5}
            className="border-gray-200 focus-visible:ring-ember bg-steam/20 resize-y min-h-[120px] rounded-lg text-sm p-3"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2.5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <AlertCircle size={16} className="shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-ember hover:bg-ember-dark text-white font-semibold h-12 rounded-lg transition-colors shadow-sm text-sm"
          >
            {loading ? "Sending..." : "Send message"}
          </Button>

          <p className="text-xs text-ash text-center leading-relaxed">
            We respond within 1 business day. No spam, ever.
          </p>
        </div>
      </form>
    </Card>
  );
}