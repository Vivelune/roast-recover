// app/api/cron/send-scheduled/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildFooter(leadId: string) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?lead=${leadId}`;
  return `
    <p style="font-size:12px;color:#888;margin-top:24px;">
      Roast & Recover LLC — Sheridan, Wyoming, 82801<br/>
      <a href="${unsubscribeUrl}">Unsubscribe</a>
    </p>
  `;
}

export async function GET(req: NextRequest) {
  // Protect the cron route — Vercel Cron sends this header automatically
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await prisma.outreachScheduledEmail.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: new Date() },
    },
    include: { lead: true },
    take: 50, // safety cap per run
  });

  const results = [];

  for (const email of due) {
    if (email.lead.unsubscribed) {
      await prisma.outreachScheduledEmail.update({
        where: { id: email.id },
        data: { status: "CANCELLED", failReason: "Lead unsubscribed before send" },
      });
      continue;
    }

    // If this is a follow-up, skip it if the lead already replied
    if (email.parentEmailId && email.lead.status === "REPLIED") {
      await prisma.outreachScheduledEmail.update({
        where: { id: email.id },
        data: { status: "CANCELLED", failReason: "Lead already replied" },
      });
      continue;
    }

    const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track/open/${email.trackingId}" width="1" height="1" style="display:none;" />`;
    const htmlBody =
      email.body.split("\n").map((line) => `<p>${line}</p>`).join("") +
      buildFooter(email.leadId) +
      trackingPixel;

    const { data, error } = await resend.emails.send({
      from: "Atif <ritual@roastandrecover.com>",
      to: email.lead.email,
      subject: email.subject,
      html: htmlBody,
    });

    if (error) {
      await prisma.outreachScheduledEmail.update({
        where: { id: email.id },
        data: { status: "FAILED", failReason: error.message },
      });
      results.push({ id: email.id, status: "failed", error: error.message });
      continue;
    }

    await prisma.outreachScheduledEmail.update({
      where: { id: email.id },
      data: { status: "SENT", sentAt: new Date() },
    });

    await prisma.outreach.update({
      where: { id: email.leadId },
      data: { status: "CONTACTED" },
    });

    results.push({ id: email.id, status: "sent", resendId: data?.id });
  }

  return NextResponse.json({ processed: results.length, results });
}