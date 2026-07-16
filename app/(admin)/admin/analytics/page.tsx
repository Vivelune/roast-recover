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
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight mb-2">
          Visitor Analytics
        </h1>
        <p className="text-sm text-ash">
          Real-time insights from your database. Track user journeys, conversion events, and page traffic patterns.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Page Views (30d)",
            value: totalViews30d.toLocaleString(),
            sub: `${totalViewsYesterday} yesterday`,
            icon: Eye,
          },
          {
            label: "Unique Visitors (30d)",
            value: uniqueSessions30d.toLocaleString(),
            sub: `${totalViews7d} views this week`,
            icon: Users,
          },
          {
            label: "New Accounts (30d)",
            value: signups30d,
            sub: "registered users",
            icon: TrendingUp,
          },
          {
            label: "Leads Submitted (30d)",
            value: leads30d,
            sub: `${conversionRate}% of visitors`,
            icon: Globe,
          },
        ].map(({ label, value, sub, icon: Icon }) => (
          <Card key={label} className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-steam flex items-center justify-center text-ash mb-4 border border-gray-100/50">
                <Icon size={16} className="text-char" />
              </div>
              <p className="font-display font-bold text-2xl sm:text-3xl text-char tracking-tight">
                {value}
              </p>
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ash">{label}</p>
              <p className="text-xs text-ash mt-0.5 font-semibold">{sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Views chart card */}
      <Card className="p-6 sm:p-8 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
        <p className="text-xs font-bold uppercase tracking-wider text-char mb-6">
          Page views — last 30 days
        </p>
        <div className="h-[240px]">
          <VisitorChart data={chartData} />
        </div>
      </Card>

      {/* Regional breakdowns and page grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top pages */}
        <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
          <p className="text-xs font-bold uppercase tracking-wider text-char mb-4">Top Pages</p>
          <div className="space-y-4">
            {topPages.map((p) => {
              const pct =
                totalViews30d > 0
                  ? Math.round((p._count.path / totalViews30d) * 100)
                  : 0;
              return (
                <div key={p.path} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-char font-semibold truncate max-w-[170px]" title={p.path}>
                      {p.path === "/" ? "Homepage" : p.path}
                    </span>
                    <span className="text-ash font-bold">
                      {p._count.path.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-steam rounded-full h-1.5">
                    <div
                      className="bg-char h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {topPages.length === 0 && (
              <p className="text-ash text-xs italic">No page records found.</p>
            )}
          </div>
        </Card>

        {/* Countries */}
        <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
          <p className="text-xs font-bold uppercase tracking-wider text-char mb-4">
            Visitors by Country
          </p>
          <div className="divide-y divide-gray-100">
            {topCountries.map((c) => (
              <div
                key={c.country}
                className="flex justify-between items-center py-2.5 text-xs first:pt-0 last:pb-0"
              >
                <span className="text-char font-semibold">{c.country ?? "Unknown"}</span>
                <span className="text-ash font-bold bg-steam px-2 py-0.5 rounded-md border border-gray-200/20">
                  {c._count.country.toLocaleString()}
                </span>
              </div>
            ))}
            {topCountries.length === 0 && (
              <p className="text-ash text-xs italic py-2">No country origin records found.</p>
            )}
          </div>
        </Card>

        {/* Referrers */}
        <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
          <p className="text-xs font-bold uppercase tracking-wider text-char mb-4">
            Traffic Sources
          </p>
          <div className="divide-y divide-gray-100">
            {topReferrers.map((r) => {
              let domain = r.referrer ?? "Direct / Search";
              try {
                if (r.referrer) {
                  domain = new URL(r.referrer).hostname.replace("www.", "");
                }
              } catch {}
              return (
                <div
                  key={r.referrer}
                  className="flex justify-between items-center py-2.5 text-xs first:pt-0 last:pb-0"
                >
                  <span className="text-char font-semibold truncate max-w-[170px]" title={domain}>
                    {domain}
                  </span>
                  <span className="text-ash font-bold bg-steam px-2 py-0.5 rounded-md border border-gray-200/20">
                    {r._count.referrer?.toLocaleString() ?? 0}
                  </span>
                </div>
              );
            })}
            {topReferrers.length === 0 && (
              <p className="text-ash text-xs italic py-2">No referrer sources found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* External reference note */}
      <p className="text-[11px] text-ash text-center pt-4">
        Custom internal engine metrics. Check{" "}
        <a
          href="https://vercel.com/analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="text-char font-semibold hover:underline"
        >
          Vercel Analytics
        </a>{" "}
        for additional technical insight records like Core Web Vitals (CWV).
      </p>
    </div>
  );
}