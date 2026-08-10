// app/api/admin/outreach/import/commit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { rows, defaultSource } = await req.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'No rows to import' }, { status: 400 });
  }

  const result = await prisma.outreach.createMany({
    data: rows.map((r: any) => ({
      email: r.email,
      name: r.name || null,
      company: r.company || null,
      phone: r.phone || null,
      source: r.source || defaultSource || 'csv_import',
    })),
    skipDuplicates: true, // safety net in case of race conditions
  });

  return NextResponse.json({ imported: result.count });
}