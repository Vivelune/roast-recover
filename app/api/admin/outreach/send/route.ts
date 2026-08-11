
  // app/api/admin/outreach/send/route.ts

  import { NextRequest, NextResponse } from "next/server";
  import { Resend } from "resend";
  import { prisma } from "@/lib/prisma";
  import { rewriteLinksForTracking } from "@/lib/outreach/rewriteLinks";
import { linkifyPlainUrls } from "@/lib/outreach/linkifyBody";
import { buildSignature } from "@/lib/outreach/buildSignature";

  const resend = new Resend(process.env.RESEND_API_KEY);

  function renderTemplate(
    template: string,
    vars: Record<string, string>
  ) {
    return template.replace(
      /{{(\w+)}}/g,
      (_, key) => vars[key] ?? ""
    );
  }

  function buildFooter(leadId: string) {
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?lead=${leadId}`;

    return `
      <p style="font-size:12px;color:#888;margin-top:24px;">
        Roast & Recover LLC — Sheridan, Wyoming, 82801<br/>
        <a href="${unsubscribeUrl}">Unsubscribe</a>
      </p>
    `;
  }

  export async function POST(req: NextRequest) {
    try {
      const { leadIds, subject, body, campaignId } = await req.json();

      if (!Array.isArray(leadIds) || leadIds.length === 0) {
        return NextResponse.json(
          { error: "No leads selected" },
          { status: 400 }
        );
      }

      if (!subject || !body) {
        return NextResponse.json(
          { error: "Subject and body are required" },
          { status: 400 }
        );
      }

      if (!process.env.RESEND_API_KEY) {
        return NextResponse.json(
          { error: "RESEND_API_KEY is not configured" },
          { status: 500 }
        );
      }

      if (!process.env.NEXT_PUBLIC_APP_URL) {
        return NextResponse.json(
          { error: "NEXT_PUBLIC_APP_URL is not configured" },
          { status: 500 }
        );
      }

      const leads = await prisma.outreach.findMany({
        where: {
          id: { in: leadIds },
          unsubscribed: false,
        },
      });

      const results = [];

      for (const lead of leads) {
        const personalizedSubject = renderTemplate(subject, {
          name: lead.name ?? "",
          company: lead.company ?? "",
        });

        const personalizedBody = renderTemplate(body, {
          name: lead.name ?? "",
          company: lead.company ?? "",
        });

        const scheduledEmail =
          await prisma.outreachScheduledEmail.create({
            data: {
              leadId: lead.id,
              campaignId: campaignId || null,
              subject: personalizedSubject,
              body: personalizedBody,
              scheduledAt: new Date(),
              status: "PENDING",
            },
          });

          const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track/open/${scheduledEmail.trackingId}" width="1" height="1" style="display:none;" />`;

          const htmlBody =
            linkifyPlainUrls(
              personalizedBody.split("\n").map((line) => `<p>${line}</p>`).join("")
            ) +
            buildSignature() +
            buildFooter(lead.id) +
            trackingPixel;
          
          const trackedHtmlBody = rewriteLinksForTracking(
            htmlBody,
            scheduledEmail.trackingId,
            process.env.NEXT_PUBLIC_APP_URL!
          );
          
        try {
          const { data, error } = await resend.emails.send({
            from: "Atif <ritual@roastandrecover.com>",
            to: lead.email,
            subject: personalizedSubject,
            html: trackedHtmlBody,
          });

          // IMPORTANT:
          // Resend can return an error without throwing an exception.
          // Therefore, we must explicitly check `error`.
          if (error) {
            await prisma.outreachScheduledEmail.update({
              where: {
                id: scheduledEmail.id,
              },
              data: {
                status: "FAILED",
                failReason: error.message,
              },
            });

            results.push({
              leadId: lead.id,
              email: lead.email,
              status: "failed",
              error: error.message,
            });

            continue;
          }

          // Resend successfully accepted the email.
          await prisma.outreachScheduledEmail.update({
            where: {
              id: scheduledEmail.id,
            },
            data: {
              status: "SENT",
              sentAt: new Date(),
            },
          });

          await prisma.outreach.update({
            where: {
              id: lead.id,
            },
            data: {
              status: "CONTACTED",
            },
          });

          results.push({
            leadId: lead.id,
            email: lead.email,
            status: "sent",
            resendId: data?.id,
          });
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Unknown email sending error";

          await prisma.outreachScheduledEmail.update({
            where: {
              id: scheduledEmail.id,
            },
            data: {
              status: "FAILED",
              failReason: errorMessage,
            },
          });

          results.push({
            leadId: lead.id,
            email: lead.email,
            status: "failed",
            error: errorMessage,
          });
        }
      }

      return NextResponse.json({
        results,
      });
    } catch (err: unknown) {
      console.error("Outreach send error:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unexpected server error";

      return NextResponse.json(
        {
          error: errorMessage,
        },
        {
          status: 500,
        }
      );
    }
  }
