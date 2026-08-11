// app/api/admin/outreach/analytics/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    totalLeads,
    statusCounts,
    allEmails,
    campaigns,
  ] = await Promise.all([
    prisma.outreach.count(),
    prisma.outreach.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.outreachScheduledEmail.findMany({
      where: { status: "SENT" },
      include: { events: true, campaign: true },
    }),
    prisma.campaign.findMany({
      include: {
        scheduledEmails: {
          where: { status: "SENT" },
          include: { events: true },
        },
      },
    }),
  ]);

  const funnel = {
    sent: allEmails.length,
    opened: allEmails.filter((e) => e.events.some((ev) => ev.type === "OPEN")).length,
    clicked: allEmails.filter((e) => e.events.some((ev) => ev.type === "CLICK")).length,
    replied: statusCounts.find((s) => s.status === "REPLIED")?._count ?? 0,
    converted: statusCounts.find((s) => s.status === "CONVERTED")?._count ?? 0,
  };

  // Opens per day, last 14 days — same shape as your RevenueChart data
  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });

  const allEvents = await prisma.outreachEmailEvent.findMany({
    where: { timestamp: { gte: new Date(days[0]) }, type: "OPEN" },
  });

  const opensByDay = days.map((day) => ({
    date: day.slice(5),
    opens: allEvents.filter((e) => e.timestamp.toISOString().startsWith(day)).length,
  }));

  const campaignStats = campaigns.map((c) => {
    const sent = c.scheduledEmails.length;
    const opened = c.scheduledEmails.filter((e) => e.events.some((ev) => ev.type === "OPEN")).length;
    const clicked = c.scheduledEmails.filter((e) => e.events.some((ev) => ev.type === "CLICK")).length;
    return {
      id: c.id,
      name: c.name,
      sent,
      opened,
      clicked,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    };
  });

  const statusMap = statusCounts.reduce(
    (acc, s) => ({ ...acc, [s.status]: s._count }),
    {} as Record<string, number>
  );

  return NextResponse.json({
    totalLeads,
    statusMap,
    funnel,
    opensByDay,
    campaignStats,
  });
}