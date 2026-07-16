import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

import { Users, Eye, TrendingUp, Globe } from "lucide-react";
import VisitorChart from "@/components/admin/VisitorChart";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalViews30d,
    totalViews7d,
    totalViewsYesterday,
    uniqueSessions30d,
    topPages,
    viewsByDay,
    topCountries,
    topReferrers,
    signups30d,
    leads30d,
  ] = await Promise.all([
    // Total page views
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: yesterday } } }),

    // Unique sessions
    prisma.pageView.groupBy({
      by: ["sessionId"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    }).then((r) => r.length),

    // Top pages
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),

    // Views by day (last 30 days)
    prisma.pageView.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),

    // Countries
    prisma.pageView.groupBy({
      by: ["country"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        country: { not: null },
      },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 8,
    }),

    // Referrers
    prisma.pageView.groupBy({
      by: ["referrer"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        referrer: { not: null },
      },
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 8,
    }),

    // New signups
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),

    // Leads submitted
    prisma.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  // Build daily chart data
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const viewsByDayMap: Record<string, number> = {};
  for (const view of viewsByDay) {
    const day = view.createdAt.toISOString().split("T")[0];
    viewsByDayMap[day] = (viewsByDayMap[day] ?? 0) + 1;
  }

  const chartData = days.map((day) => ({
    date: day.slice(5), // MM-DD
    views: viewsByDayMap[day] ?? 0,
  }));

  const conversionRate =
    totalViews30d > 0
      ? ((leads30d / totalViews30d) * 100).toFixed(2)
      : "0.00";

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        Visitor analytics
      </h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Page views (30d)",
            value: totalViews30d.toLocaleString(),
            sub: `${totalViewsYesterday} yesterday`,
            icon: Eye,
          },
          {
            label: "Unique visitors (30d)",
            value: uniqueSessions30d.toLocaleString(),
            sub: `${totalViews7d} views this week`,
            icon: Users,
          },
          {
            label: "New accounts (30d)",
            value: signups30d,
            sub: "registered users",
            icon: TrendingUp,
          },
          {
            label: "Leads submitted (30d)",
            value: leads30d,
            sub: `${conversionRate}% of visitors`,
            icon: Globe,
          },
        ].map(({ label, value, sub, icon: Icon }) => (
          <Card key={label} className="p-4">
            <Icon size={16} className="text-ash mb-3" />
            <p className="font-display font-semibold text-2xl text-char">
              {value}
            </p>
            <p className="text-xs font-medium text-ash mt-0.5">{label}</p>
            <p className="text-xs text-ash/60 mt-0.5">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Views chart */}
      <Card className="p-5 mb-8">
        <p className="text-sm font-medium text-char mb-4">
          Page views — last 30 days
        </p>
        <VisitorChart data={chartData} />
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Top pages */}
        <Card className="p-5 md:col-span-1">
          <p className="text-sm font-medium text-char mb-4">Top pages</p>
          <div className="space-y-2.5">
            {topPages.map((p, i) => {
              const pct =
                totalViews30d > 0
                  ? Math.round((p._count.path / totalViews30d) * 100)
                  : 0;
              return (
                <div key={p.path}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-char truncate max-w-[140px]" title={p.path}>
                      {p.path === "/" ? "Homepage" : p.path}
                    </span>
                    <span className="text-ash shrink-0 ml-2">
                      {p._count.path.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1">
                    <div
                      className="bg-ember h-1 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {topPages.length === 0 && (
              <p className="text-ash text-sm">No data yet</p>
            )}
          </div>
        </Card>

        {/* Countries */}
        <Card className="p-5">
          <p className="text-sm font-medium text-char mb-4">
            Visitors by country
          </p>
          <div className="space-y-2">
            {topCountries.map((c) => (
              <div
                key={c.country}
                className="flex justify-between text-xs"
              >
                <span className="text-char">{c.country ?? "Unknown"}</span>
                <span className="text-ash">
                  {c._count.country.toLocaleString()}
                </span>
              </div>
            ))}
            {topCountries.length === 0 && (
              <p className="text-ash text-sm">No data yet</p>
            )}
          </div>
        </Card>

        {/* Referrers */}
        <Card className="p-5">
          <p className="text-sm font-medium text-char mb-4">
            Traffic sources
          </p>
          <div className="space-y-2">
            {topReferrers.map((r) => {
              let domain = r.referrer ?? "Direct";
              try {
                if (r.referrer) {
                  domain = new URL(r.referrer).hostname.replace("www.", "");
                }
              } catch {}
              return (
                <div
                  key={r.referrer}
                  className="flex justify-between text-xs"
                >
                  <span className="text-char truncate max-w-[150px]">
                    {domain}
                  </span>
                  <span className="text-ash">
                    {r._count.referrer?.toLocaleString()}
                  </span>
                </div>
              );
            })}
            {topReferrers.length === 0 && (
              <p className="text-ash text-sm">No referrer data yet</p>
            )}
          </div>
        </Card>
      </div>

      <p className="text-xs text-ash text-center">
        Data from your own database. Also check{" "}
        <a
          href="https://vercel.com/analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ember hover:underline"
        >
          Vercel Analytics
        </a>{" "}
        for additional insights including Core Web Vitals.
      </p>
    </div>
  );
}