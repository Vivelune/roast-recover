
// app/api/admin/outreach/schedule/[id]/cancel/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.outreachScheduledEmail.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
        failReason: "Cancelled manually from queue",
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (err) {
    console.error(
      "Failed to cancel scheduled email:",
      err
    );

    return NextResponse.json(
      {
        error: "Failed to cancel scheduled email",
      },
      {
        status: 500,
      }
    );
  }
}

