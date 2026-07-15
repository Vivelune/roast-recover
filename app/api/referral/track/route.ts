import { NextRequest, NextResponse } from "next/server";
import { trackReferral } from "@/app/actions/referral";

export async function POST(req: NextRequest) {
  const { code, email } = await req.json();
  if (!code || !email) {
    return NextResponse.json({ ok: false });
  }
  await trackReferral(code, email);
  return NextResponse.json({ ok: true });
}