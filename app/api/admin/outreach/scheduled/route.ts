// app/api/admin/outreach/scheduled/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const scheduled = await prisma.outreachScheduledEmail.findMany({
    where: { status: "PENDING" },
    include: { lead: true, campaign: true },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({ scheduled });
}