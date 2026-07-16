import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false });

  const { id } = await params;
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}