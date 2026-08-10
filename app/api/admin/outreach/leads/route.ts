// app/api/admin/outreach/leads/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.outreach.findMany({
    where: { unsubscribed: false },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ leads });
}