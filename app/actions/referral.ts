"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = "Roast & Recover <ritual@roastandrecover.com>";
const REFERRAL_CREDIT_CENTS = 2000; // $20 store credit per qualified referral

function generateCode(name: string): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 6);
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `${base}${suffix}`;
}

export async function getOrCreateReferralCode() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const existing = await prisma.referralCode.findUnique({
    where: { userId: user.id },
    include: {
      referrals: { orderBy: { createdAt: "desc" } },
    },
  });
  if (existing) return existing;

  // Generate a unique code
  let code = generateCode(user.name ?? user.email);
  let attempts = 0;
  while (attempts < 10) {
    const taken = await prisma.referralCode.findUnique({ where: { code } });
    if (!taken) break;
    code = generateCode(user.name ?? user.email);
    attempts++;
  }

  const created = await prisma.referralCode.create({
    data: { userId: user.id, code },
    include: { referrals: true },
  });


  return created;
}

export async function trackReferral(code: string, refereeEmail: string) {
  // Called when a new user signs up — check if they used a referral code
  const referralCode = await prisma.referralCode.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!referralCode) return null;

  const referee = await prisma.user.findUnique({
    where: { email: refereeEmail },
  });
  if (!referee) return null;

  // Don't let someone refer themselves
  if (referralCode.userId === referee.id) return null;

  await prisma.referral.upsert({
    where: {
      codeId_refereeId: { codeId: referralCode.id, refereeId: referee.id },
    },
    update: {},
    create: {
      codeId: referralCode.id,
      referrerId: referralCode.userId,
      refereeId: referee.id,
      refereeEmail,
      status: "pending",
    },
  });

  return referralCode;
}

export async function qualifyReferral(refereeId: string) {
  // Called when a referred user places their first paid order
  const referral = await prisma.referral.findFirst({
    where: { refereeId, status: "pending" },
    include: { code: { include: { user: true } } },
  });
  if (!referral) return;

  // Mark as qualified
  await prisma.referral.update({
    where: { id: referral.id },
    data: { status: "qualified" },
  });

  // Issue store credit to the referrer
  await prisma.storeCredit.create({
    data: {
      userId: referral.referrerId,
      amountCents: REFERRAL_CREDIT_CENTS,
      reason: `Referral: ${referral.refereeEmail}`,
    },
  });

  await prisma.referral.update({
    where: { id: referral.id },
    data: { status: "credited", creditIssuedAt: new Date() },
  });

  // Email the referrer
  await resend.emails.send({
    from: FROM,
    to: referral.code.user.email,
    subject: "You earned $20 store credit — your referral placed their first order",
    html: `
      <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0E0B08;">
        <p style="font-size:18px;font-weight:600;margin:0 0 8px;">
          roast<span style="color:#B5481F;">&</span>recover
        </p>
        <hr style="border:none;border-top:1px solid #e5e1db;margin:16px 0 24px;"/>
        <p style="font-size:15px;margin:0 0 12px;">
          Hi${referral.code.user.name ? ` ${referral.code.user.name.split(" ")[0]}` : ""},
        </p>
        <p style="font-size:15px;color:#7A6A58;margin:0 0 20px;">
          <strong style="color:#0E0B08;">${referral.refereeEmail}</strong> just placed 
          their first order using your referral code. We've added 
          <strong style="color:#B5481F;">$${(REFERRAL_CREDIT_CENTS / 100).toFixed(0)} store credit</strong> 
          to your account.
        </p>
        <a href="${process.env.NEXT_PUBLIC_URL}/account/referrals"
           style="display:inline-block;background:#B5481F;color:#fff;
                  text-decoration:none;padding:12px 24px;border-radius:6px;
                  font-size:14px;font-weight:500;">
          View your referrals →
        </a>
      </div>
    `,
  });

  revalidatePath("/account/referrals");
}

export async function getStoreCreditBalance(userId: string) {
  const credits = await prisma.storeCredit.findMany({
    where: { userId, usedAt: null },
  });
  return credits.reduce((sum, c) => sum + c.amountCents, 0);
}