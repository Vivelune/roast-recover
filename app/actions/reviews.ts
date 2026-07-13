"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitReview(data: {
  productId: string;
  rating: number;
  title?: string;
  body: string;
  slug: string;
  category: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in to leave a review");

  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  if (!data.body.trim()) throw new Error("Review body is required");

  // Check if user has purchased this product (verified review)
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: data.productId,
      order: {
        userId: user.id,
        status: { in: ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] },
      },
    },
  });

  await prisma.review.upsert({
    where: { productId_userId: { productId: data.productId, userId: user.id } },
    update: { rating: data.rating, title: data.title, body: data.body },
    create: {
      productId: data.productId,
      userId: user.id,
      rating: data.rating,
      title: data.title,
      body: data.body,
      verified: !!purchased,
    },
  });

  const path =
    data.category === "EQUIPMENT"
      ? `/equipment/${data.slug}`
      : `/packaging/${data.slug}`;

  revalidatePath(path);
}

export async function deleteReview(reviewId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  await prisma.review.deleteMany({
    where: { id: reviewId, userId: user.id },
  });
}