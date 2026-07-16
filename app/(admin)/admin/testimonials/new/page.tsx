import { redirect } from "next/navigation";
import { createTestimonial } from "@/app/actions/testimonials";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewTestimonialPage() {
  async function handleCreate(formData: FormData) {
    "use server";
    await createTestimonial({
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      company: formData.get("company") as string,
      location: (formData.get("location") as string) || undefined,
      quote: formData.get("quote") as string,
      logoUrl: (formData.get("logoUrl") as string) || undefined,
      avatarUrl: (formData.get("avatarUrl") as string) || undefined,
      rating: parseInt(formData.get("rating") as string) || 5,
      featured: formData.get("featured") === "on",
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
    });
    redirect("/admin/testimonials");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <Link
        href="/admin/testimonials"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ash hover:text-char transition-colors"
      >
        <ArrowLeft size={13} /> Back to Testimonials
      </Link>
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight mb-2">
          New Testimonial
        </h1>
        <p className="text-sm text-ash">
          Introduce verified customer stories to bolster product social proof.
        </p>
      </div>
      <TestimonialForm action={handleCreate} />
    </div>
  );
}

export function TestimonialForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: Record<string, any>;
}) {
  return (
    <Card className="p-6 sm:p-8 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
      <form action={action} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-char">
              Customer Name
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Marcus Chen"
              defaultValue={defaults?.name}
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-char">
              Role / Title
            </Label>
            <Input
              id="role"
              name="role"
              required
              placeholder="Owner"
              defaultValue={defaults?.role}
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-char">
              Company / Café Name
            </Label>
            <Input
              id="company"
              name="company"
              required
              placeholder="Eleven Coffee"
              defaultValue={defaults?.company}
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-char">
              Location <span className="text-ash font-normal text-[10px] lowercase italic">(optional)</span>
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="Austin, TX"
              defaultValue={defaults?.location}
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quote" className="text-xs font-bold uppercase tracking-wider text-char">
            Quote
          </Label>
          <Textarea
            id="quote"
            name="quote"
            required
            placeholder="What did they say about working with Roast & Recover?"
            rows={4}
            defaultValue={defaults?.quote}
            className="rounded-xl border-gray-200 focus-visible:ring-char text-xs resize-none"
          />
          <p className="text-[11px] text-ash italic">
            Write in first person, as the customer would say it. 2–4 sentences is ideal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="logoUrl" className="text-xs font-bold uppercase tracking-wider text-char">
              Logo URL <span className="text-ash font-normal text-[10px] lowercase italic">(optional)</span>
            </Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              placeholder="https://..."
              defaultValue={defaults?.logoUrl}
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl" className="text-xs font-bold uppercase tracking-wider text-char">
              Avatar URL <span className="text-ash font-normal text-[10px] lowercase italic">(optional)</span>
            </Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              placeholder="https://..."
              defaultValue={defaults?.avatarUrl}
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="rating" className="text-xs font-bold uppercase tracking-wider text-char">
              Rating (1–5 Stars)
            </Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="1"
              max="5"
              defaultValue={defaults?.rating ?? 5}
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder" className="text-xs font-bold uppercase tracking-wider text-char">
              Sort Order
            </Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={defaults?.sortOrder ?? 0}
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
            <p className="text-[10px] text-ash font-medium uppercase tracking-wide">Lower values display first</p>
          </div>
        </div>

        <div className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 bg-[#FBFBFA]">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            defaultChecked={defaults?.featured ?? false}
            className="accent-char w-4 h-4 mt-0.5"
          />
          <Label htmlFor="featured" className="cursor-pointer text-xs font-medium text-char leading-relaxed">
            Feature this testimonial — <span className="text-ash">Highlights the entry in a wider format on the homepage landing display.</span>
          </Label>
        </div>

        <Button type="submit" className="w-full bg-char hover:bg-char/90 text-white rounded-xl h-11 font-bold uppercase tracking-wider text-xs">
          Save testimonial
        </Button>
      </form>
    </Card>
  );
}