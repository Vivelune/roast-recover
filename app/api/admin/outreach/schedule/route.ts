// app/api/admin/outreach/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

export async function POST(req: NextRequest) {
  const { leadIds, subject, body, scheduledAt, campaignId, parentEmailId } = await req.json();

  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return NextResponse.json({ error: "No leads selected" }, { status: 400 });
  }
  if (!scheduledAt) {
    return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
  }

  const leads = await prisma.outreach.findMany({
    where: { id: { in: leadIds }, unsubscribed: false },
  });

  const created = await Promise.all(
    leads.map((lead) =>
      prisma.outreachScheduledEmail.create({
        data: {
          leadId: lead.id,
          campaignId: campaignId || null,
          parentEmailId: parentEmailId || null,
          subject: renderTemplate(subject, { name: lead.name ?? "", company: lead.company ?? "" }),
          body: renderTemplate(body, { name: lead.name ?? "", company: lead.company ?? "" }),
          scheduledAt: new Date(scheduledAt),
          status: "PENDING",
        },
      })
    )
  );

  return NextResponse.json({ scheduled: created.length });
}