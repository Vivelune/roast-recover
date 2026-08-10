
// app/api/admin/outreach/leads/[id]/timeline/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await prisma.outreach.findUnique({
      where: {
        id,
      },
      include: {
        scheduledEmails: {
          include: {
            events: true,
          },
          orderBy: {
            scheduledAt: "asc",
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lead,
    });
  } catch (error) {
    console.error("Timeline API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load lead timeline",
      },
      { status: 500 }
    );
  }
}

