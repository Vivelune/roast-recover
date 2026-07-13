import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();
  const {
    name, description, category, price,
    depositPercent, leadTimeDays, stripePriceId,
    isSubscribable, images,
  } = body;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      category,
      priceCents: Math.round(parseFloat(price) * 100),
      depositPercent: depositPercent ? parseInt(depositPercent) : null,
      leadTimeDays: leadTimeDays ? parseInt(leadTimeDays) : null,
      stripePriceId: stripePriceId || null,
      isSubscribable: isSubscribable ?? false,
      images: images ?? [],
      active: true,
    },
  });

  return NextResponse.json(product);
}