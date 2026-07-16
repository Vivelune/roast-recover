import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { updateTestimonial, deleteTestimonial } from "@/app/actions/testimonials";
import { TestimonialForm } from "../../new/page";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DeleteTestimonialButton from "@/components/admin/DeleteTestimonialButton";

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
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <Link
        href="/admin/testimonials"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ash hover:text-char transition-colors"
      >
        <ArrowLeft size={13} /> Back to Testimonials
      </Link>
      
      <div className="flex items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
            Edit Testimonial
          </h1>
        </div>
        <form action={handleDelete}>
          <DeleteTestimonialButton />
        </form>
      </div>

      <TestimonialForm action={handleUpdate} defaults={t} />
    </div>
  );
}