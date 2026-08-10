
// app/api/admin/outreach/leads/[id]/mark-replied/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Mark the lead as replied
    await prisma.outreach.update({
      where: {
        id,
      },
      data: {
        status: "REPLIED",
      },
    });

    // Cancel any pending follow-ups for this lead
    await prisma.outreachScheduledEmail.updateMany({
      where: {
        leadId: id,
        status: "PENDING",
      },
      data: {
        status: "CANCELLED",
        failReason: "Lead marked as replied manually",
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Mark replied error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark lead as replied",
      },
      {
        status: 500,
      }
    );
  }
}

