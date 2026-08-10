// app/unsubscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const leadId = req.nextUrl.searchParams.get("lead");
  if (!leadId) return NextResponse.json({ error: "Missing lead id" }, { status: 400 });

  await prisma.outreach.update({
    where: { id: leadId },
    data: { unsubscribed: true, status: "UNSUBSCRIBED" },
  });

  return new NextResponse(
    `<html><body style="font-family:sans-serif;text-align:center;padding:60px;">
      <h2>You've been unsubscribed.</h2>
      <p>You won't receive further emails from Roast & Recover.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}