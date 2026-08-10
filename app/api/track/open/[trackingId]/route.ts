
// app/api/track/open/[trackingId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1x1 transparent GIF, base64-encoded
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7",
  "base64"
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { trackingId } = await params;

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
          type: "OPEN",
        },
      });

      // Only bump lead status forward.
      // Never move REPLIED/CONVERTED backwards.
      const lead = await prisma.outreach.findUnique({
        where: {
          id: email.leadId,
        },
      });

      if (lead && lead.status === "CONTACTED") {
        await prisma.outreach.update({
          where: {
            id: email.leadId,
          },
          data: {
            status: "OPENED",
          },
        });
      }
    }
  } catch (err) {
    // Never let tracking failures break the pixel response
    console.error("Open tracking error:", err);
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control":
        "no-store, no-cache, must-revalidate, private",
    },
  });
}
