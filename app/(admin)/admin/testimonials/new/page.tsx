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
    <div className="max-w-xl">
      <Link
        href="/admin/testimonials"
        className="inline-flex items-center gap-1.5 text-sm text-ash hover:text-char mb-6"
      >
        <ArrowLeft size={14} /> Back
      </Link>
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        New testimonial
      </h1>
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
    <Card className="p-6">
      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Customer name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Marcus Chen"
              defaultValue={defaults?.name}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Role / title</Label>
            <Input
              id="role"
              name="role"
              required
              placeholder="Owner"
              defaultValue={defaults?.role}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="company">Company / café name</Label>
            <Input
              id="company"
              name="company"
              required
              placeholder="Eleven Coffee"
              defaultValue={defaults?.company}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">
              Location{" "}
              <span className="text-ash text-xs">(optional)</span>
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="Austin, TX"
              defaultValue={defaults?.location}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quote">Quote</Label>
          <Textarea
            id="quote"
            name="quote"
            required
            placeholder="What did they say about working with Roast & Recover?"
            rows={4}
            defaultValue={defaults?.quote}
          />
          <p className="text-xs text-ash">
            Write in first person, as the customer would say it. 2–4 sentences is ideal.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="logoUrl">
              Logo URL{" "}
              <span className="text-ash text-xs">(optional)</span>
            </Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              placeholder="https://..."
              defaultValue={defaults?.logoUrl}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl">
              Avatar URL{" "}
              <span className="text-ash text-xs">(optional)</span>
            </Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              placeholder="https://..."
              defaultValue={defaults?.avatarUrl}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="rating">Rating (1–5)</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="1"
              max="5"
              defaultValue={defaults?.rating ?? 5}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={defaults?.sortOrder ?? 0}
            />
            <p className="text-xs text-ash">Lower = shown first</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            defaultChecked={defaults?.featured ?? false}
            className="accent-ember w-4 h-4"
          />
          <Label htmlFor="featured" className="cursor-pointer">
            Feature this testimonial (shown prominently on homepage)
          </Label>
        </div>

        <Button type="submit" className="w-full bg-ember hover:bg-ember-dark">
          Save testimonial
        </Button>
      </form>
    </Card>
  );
}