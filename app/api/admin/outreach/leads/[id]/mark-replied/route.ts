// app/api/admin/outreach/leads/[id]/mark-replied/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await prisma.outreach.update({
    where: { id: params.id },
    data: { status: "REPLIED" },
  });

  // Cancel any pending follow-ups for this lead
  await prisma.outreachScheduledEmail.updateMany({
    where: { leadId: params.id, status: "PENDING" },
    data: { status: "CANCELLED", failReason: "Lead marked as replied manually" },
  });

  return NextResponse.json({ ok: true });
}