"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTestimonial(data: {
  name: string;
  role: string;
  company: string;
  location?: string;
  quote: string;
  logoUrl?: string;
  avatarUrl?: string;
  rating: number;
  featured: boolean;
  sortOrder: number;
}) {
  await prisma.testimonial.create({ data });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function updateTestimonial(
  id: string,
  data: Partial<{
    name: string;
    role: string;
    company: string;
    location: string;
    quote: string;
    logoUrl: string;
    avatarUrl: string;
    rating: number;
    featured: boolean;
    active: boolean;
    sortOrder: number;
  }>
) {
  await prisma.testimonial.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function deleteTestimonial(id: string) {
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function toggleTestimonialActive(id: string, active: boolean) {
  await prisma.testimonial.update({ where: { id }, data: { active } });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}