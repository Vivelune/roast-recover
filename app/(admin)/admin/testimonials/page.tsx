import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Star, Eye, EyeOff } from "lucide-react";
import { toggleTestimonialActive } from "@/app/actions/testimonials";
import { Card } from "@/components/ui/card";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight mb-2">
            Testimonials
          </h1>
          <p className="text-ash text-sm">
            Manage your brand advocates. Active reviews surface immediately on the homepage with zero downtime.
          </p>
        </div>
        <Button asChild className="bg-char hover:bg-char/90 text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs self-start sm:self-auto">
          <Link href="/admin/testimonials/new">
            <Plus size={14} className="mr-2" /> Add testimonial
          </Link>
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-2xl bg-white">
          <div className="w-12 h-12 rounded-2xl bg-steam flex items-center justify-center text-ash mx-auto mb-4 border border-gray-100">
            <Star size={20} className="text-char" />
          </div>
          <p className="text-char font-semibold">No testimonials yet</p>
          <p className="text-ash text-xs mt-1 mb-6 max-w-sm mx-auto">
            Add client feedback to establish solid commercial credibility right on your landing page.
          </p>
          <Button asChild className="bg-char hover:bg-char/90 text-white rounded-xl h-10 px-6 font-bold uppercase tracking-wider text-xs">
            <Link href="/admin/testimonials/new">Add first testimonial</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <Card
              key={t.id}
              className={`border p-5 rounded-2xl transition-all duration-200 ${
                t.active 
                  ? "border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white" 
                  : "border-gray-100 bg-gray-50/70 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-6 min-w-0">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-char text-sm truncate">{t.name}</p>
                    <span className="text-gray-300 text-xs">•</span>
                    <p className="text-ash text-xs font-semibold truncate">{t.role}, {t.company}</p>
                    {t.featured && (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-bold uppercase tracking-wider rounded-lg px-2 py-0.5 shrink-0">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  {/* UPDATED CLASS:
                    `line-clamp-2` clamps the text to 2 lines on mobile.
                    `sm:line-clamp-none` shows the full quote on tablet/desktop widths.
                  */}
                  <p className="text-char text-sm leading-relaxed italic pr-4 break-words whitespace-pre-wrap line-clamp-3 sm:line-clamp-none">
                    "{t.quote}"
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-ash pt-1">
                    <span>Sort Order: {t.sortOrder}</span>
                    {t.rating && (
                      <span className="text-amber-500 flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} size={10} fill="currentColor" className="stroke-none" />
                        ))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-0.5 select-none whitespace-nowrap">
                  <form
                    action={async () => {
                      "use server";
                      await toggleTestimonialActive(t.id, !t.active);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-steam transition-colors text-char"
                    >
                      {t.active ? (
                        <>
                          <EyeOff size={13} className="text-ash shrink-0" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye size={13} className="text-ash shrink-0" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </form>
                  <Link
                    href={`/admin/testimonials/${t.id}/edit`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 hover:bg-steam text-char transition-colors shrink-0"
                  >
                    <Pencil size={13} />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}