// app/api/admin/outreach/scheduled/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await prisma.outreachScheduledEmail.update({
    where: { id: params.id },
    data: { status: "CANCELLED", failReason: "Cancelled manually from queue" },
  });
  return NextResponse.json({ ok: true });
}