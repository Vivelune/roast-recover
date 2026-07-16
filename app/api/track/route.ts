import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Pages we don't need to track (noise)
const SKIP_PATHS = [
  "/api/",
  "/_next/",
  "/favicon",
  "/robots",
  "/sitemap",
  "/sign-in",
  "/sign-up",
  "/admin",
];

export async function POST(req: NextRequest) {
  try {
    const { path, sessionId, userId } = await req.json();

    if (!path || !sessionId) {
      return NextResponse.json({ ok: false });
    }

    // Skip internal/admin paths
    if (SKIP_PATHS.some((skip) => path.startsWith(skip))) {
      return NextResponse.json({ ok: true });
    }

    const country =
      req.headers.get("x-vercel-ip-country") ??
      req.headers.get("cf-ipcountry") ??
      null;

    const userAgent = req.headers.get("user-agent")?.slice(0, 200) ?? null;
    const referrer = req.headers.get("referer")?.slice(0, 500) ?? null;

    // Deduplicate: same session + same path within 30 minutes = one view
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const existing = await prisma.pageView.findFirst({
      where: {
        sessionId,
        path,
        createdAt: { gte: thirtyMinsAgo },
      },
    });

    if (!existing) {
      await prisma.pageView.create({
        data: { path, sessionId, userId, country, userAgent, referrer },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}