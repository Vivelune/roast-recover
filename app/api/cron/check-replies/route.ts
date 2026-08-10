
// app/api/cron/check-replies/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (
    authHeader !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const client = new ImapFlow({
    host: process.env.HOSTINGER_IMAP_HOST!,
    port: 993,
    secure: true,
    auth: {
      user: process.env.HOSTINGER_EMAIL!,
      pass: process.env.HOSTINGER_EMAIL_PASSWORD!,
    },
  });

  const matched: string[] = [];

  try {
    await client.connect();

    const lock =
      await client.getMailboxLock("INBOX");

    try {
      // Only check unseen messages from the last 7 days
      // to keep this fast.
      const since = new Date();
      since.setDate(since.getDate() - 7);

      for await (const message of client.fetch(
        {
          since,
          seen: false,
        },
        {
          envelope: true,
          source: true,
        }
      )) {
        // ImapFlow can return an undefined source.
        // Do not pass it to simpleParser.
        if (!message.source) {
          continue;
        }

        const parsed = await simpleParser(
          message.source
        );

        const fromEmail =
          parsed.from?.value?.[0]?.address
            ?.toLowerCase();

        if (!fromEmail) {
          continue;
        }

        const lead =
          await prisma.outreach.findUnique({
            where: {
              email: fromEmail,
            },
          });

        if (
          lead &&
          lead.status !== "REPLIED" &&
          lead.status !== "CONVERTED"
        ) {
          // Mark the lead as replied
          await prisma.outreach.update({
            where: {
              id: lead.id,
            },
            data: {
              status: "REPLIED",
            },
          });

          // Cancel any pending follow-ups
          await prisma.outreachScheduledEmail.updateMany({
            where: {
              leadId: lead.id,
              status: "PENDING",
            },
            data: {
              status: "CANCELLED",
              failReason:
                "Lead replied — detected via IMAP",
            },
          });

          matched.push(fromEmail);
        }

        // Mark the message as seen so we don't
        // process it again on the next cron run.
        await client.messageFlagsAdd(
          message.uid,
          ["\\Seen"],
          { uid: true }
        );
      }
    } finally {
      lock.release();
    }
  } catch (err) {
    console.error(
      "IMAP reply check error:",
      err
    );

    return NextResponse.json(
      { error: "IMAP check failed" },
      { status: 500 }
    );
  } finally {
    // Only logout if the connection is still usable.
    try {
      await client.logout();
    } catch (err) {
      console.error(
        "IMAP logout error:",
        err
      );
    }
  }

  return NextResponse.json({
    matched,
    count: matched.length,
  });
}
