import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { updateTestimonial, deleteTestimonial } from "@/app/actions/testimonials";
import { TestimonialForm } from "../../new/page";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await prisma.testimonial.findUnique({ where: { id } });
  if (!t) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateTestimonial(id, {
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

  async function handleDelete() {
    "use server";
    await deleteTestimonial(id);
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-semibold text-2xl text-char">
          Edit testimonial
        </h1>
        <form action={handleDelete}>
          <button
            type="submit"
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
            onClick={(e) => {
              if (!confirm("Delete this testimonial? This cannot be undone."))
                e.preventDefault();
            }}
          >
            Delete
          </button>
        </form>
      </div>
      <TestimonialForm action={handleUpdate} defaults={t} />
    </div>
  );
}