// app/api/admin/outreach/import/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { prisma } from '@/lib/prisma';

interface ParsedRow {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  source?: string;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json(
      { error: 'CSV parse error', details: parsed.errors },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid: ParsedRow[] = [];
  const invalid: { row: Record<string, string>; reason: string }[] = [];
  const seenInFile = new Set<string>();

  for (const row of parsed.data) {
    const email = row.email?.trim().toLowerCase();

    if (!email || !emailRegex.test(email)) {
      invalid.push({ row, reason: 'Missing or invalid email' });
      continue;
    }
    if (seenInFile.has(email)) {
      invalid.push({ row, reason: 'Duplicate within this file' });
      continue;
    }
    seenInFile.add(email);

    valid.push({
      email,
      name: row.name?.trim() || undefined,
      company: row.company?.trim() || undefined,
      phone: row.phone?.trim() || undefined,
      source: row.source?.trim() || undefined,
    });
  }

  // Check against existing DB records
  const existing = await prisma.outreach.findMany({
    where: { email: { in: valid.map((r) => r.email) } },
    select: { email: true },
  });
  const existingEmails = new Set(existing.map((e) => e.email));

  const newRows = valid.filter((r) => !existingEmails.has(r.email));
  const alreadyExists = valid.filter((r) => existingEmails.has(r.email));

  return NextResponse.json({
    newRows,
    alreadyExists: alreadyExists.map((r) => r.email),
    invalid,
    summary: {
      total: parsed.data.length,
      willImport: newRows.length,
      skippedExisting: alreadyExists.length,
      skippedInvalid: invalid.length,
    },
  });
}