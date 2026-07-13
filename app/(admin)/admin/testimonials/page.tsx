import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Star } from "lucide-react";
import { toggleTestimonialActive } from "@/app/actions/testimonials";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char mb-1">
            Testimonials
          </h1>
          <p className="text-ash text-sm">
            Manage what appears on the homepage. Active testimonials show
            immediately — no deploy needed.
          </p>
        </div>
        <Button asChild className="bg-ember hover:bg-ember-dark">
          <Link href="/admin/testimonials/new">
            <Plus size={15} className="mr-1.5" /> Add testimonial
          </Link>
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <Star size={24} className="text-ash mx-auto mb-3" />
          <p className="text-char font-medium mb-1">No testimonials yet</p>
          <p className="text-ash text-sm mb-4">
            Add your first customer testimonial to build homepage social proof.
          </p>
          <Button asChild className="bg-ember hover:bg-ember-dark">
            <Link href="/admin/testimonials/new">Add first testimonial</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`border rounded-lg p-4 flex items-start justify-between gap-4 ${
                t.active ? "border-border" : "border-border bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-char text-sm">{t.name}</p>
                  <span className="text-ash text-xs">·</span>
                  <p className="text-ash text-xs">{t.role}, {t.company}</p>
                  {t.featured && (
                    <Badge className="bg-ember/10 text-ember border-ember/20 text-[10px]">
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-ash text-sm leading-relaxed line-clamp-2">
                  "{t.quote}"
                </p>
                <p className="text-xs text-ash mt-1">
                  Sort order: {t.sortOrder}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <form
                  action={async () => {
                    "use server";
                    await toggleTestimonialActive(t.id, !t.active);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs text-ash hover:text-char transition-colors"
                  >
                    {t.active ? "Hide" : "Show"}
                  </button>
                </form>
                <Link
                  href={`/admin/testimonials/${t.id}/edit`}
                  className="text-ash hover:text-char"
                >
                  <Pencil size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}