"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function makeSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function createPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const slug = makeSlug(title);
  const published = formData.get("published") === "on";

  await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      category: formData.get("category") as string,
      coverUrl: (formData.get("coverUrl") as string) || null,
      tags: (formData.get("tags") as string)
        ?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
      readingMins: parseInt(formData.get("readingMins") as string) || 5,
      authorName: (formData.get("authorName") as string) || "Roast & Recover",
      seoTitle: (formData.get("seoTitle") as string) || null,
      seoDesc: (formData.get("seoDesc") as string) || null,
      published,
      publishedAt: published ? new Date() : null,
    },
  });

  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updatePost(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const published = formData.get("published") === "on";

  await prisma.blogPost.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      category: formData.get("category") as string,
      coverUrl: (formData.get("coverUrl") as string) || null,
      tags: (formData.get("tags") as string)
        ?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
      readingMins: parseInt(formData.get("readingMins") as string) || 5,
      authorName: (formData.get("authorName") as string) || "Roast & Recover",
      seoTitle: (formData.get("seoTitle") as string) || null,
      seoDesc: (formData.get("seoDesc") as string) || null,
      published,
      publishedAt: published ? new Date() : null,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${formData.get("slug")}`);
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}