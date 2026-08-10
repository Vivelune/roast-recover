
// app/api/track/click/[trackingId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  const { trackingId } = await params;

  const destination = req.nextUrl.searchParams.get("url");

  if (!destination) {
    return NextResponse.json(
      { error: "Missing url param" },
      { status: 400 }
    );
  }

  try {
    const email =
      await prisma.outreachScheduledEmail.findUnique({
        where: {
          trackingId,
        },
      });

    if (email) {
      await prisma.outreachEmailEvent.create({
        data: {
          scheduledEmailId: email.id,
          type: "CLICK",
          url: destination,
        },
      });
    }
  } catch (err) {
    console.error("Click tracking error:", err);
  }

  return NextResponse.redirect(destination);
}

