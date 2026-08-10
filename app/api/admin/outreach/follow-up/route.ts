// app/api/admin/outreach/follow-up/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

export async function POST(req: NextRequest) {
  const { parentEmailId, subject, body, delayDays, scheduledAt } = await req.json();

  if (!parentEmailId) {
    return NextResponse.json({ error: "parentEmailId is required" }, { status: 400 });
  }

  const parent = await prisma.outreachScheduledEmail.findUnique({
    where: { id: parentEmailId },
    include: { lead: true },
  });

  if (!parent) {
    return NextResponse.json({ error: "Parent email not found" }, { status: 404 });
  }

  // Either explicit scheduledAt, or relative to parent's send time
  let followUpAt: Date;
  if (scheduledAt) {
    followUpAt = new Date(scheduledAt);
  } else if (delayDays && parent.sentAt) {
    followUpAt = new Date(parent.sentAt.getTime() + delayDays * 24 * 60 * 60 * 1000);
  } else if (delayDays) {
    // parent not sent yet — base off its scheduledAt instead
    followUpAt = new Date(parent.scheduledAt.getTime() + delayDays * 24 * 60 * 60 * 1000);
  } else {
    return NextResponse.json(
      { error: "Provide either scheduledAt or delayDays" },
      { status: 400 }
    );
  }

  const followUp = await prisma.outreachScheduledEmail.create({
    data: {
      leadId: parent.leadId,
      campaignId: parent.campaignId,
      parentEmailId: parent.id,
      subject: renderTemplate(subject, {
        name: parent.lead.name ?? "",
        company: parent.lead.company ?? "",
      }),
      body: renderTemplate(body, {
        name: parent.lead.name ?? "",
        company: parent.lead.company ?? "",
      }),
      scheduledAt: followUpAt,
      status: "PENDING",
    },
  });

  return NextResponse.json({ followUp });
}