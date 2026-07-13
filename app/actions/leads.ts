"use server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = "Roast & Recover <ritual@roastandrecover.com>";

export async function submitLead(data: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  interest?: string;
  productId?: string;
}) {
  if (!data.name.trim()) throw new Error("Name is required");
  if (!data.email.trim()) throw new Error("Email is required");
  if (!data.message.trim()) throw new Error("Message is required");

  // Save to DB
  const lead = await prisma.lead.create({ data });

  // Auto-reply to the inquirer
  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "We received your enquiry — Roast & Recover",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #0E0B08;">
        <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">
          roast<span style="color:#B5481F;">&</span>recover
        </p>
        <hr style="border:none;border-top:1px solid #e5e1db;margin:16px 0 24px;" />
        <p style="font-size: 15px; margin: 0 0 12px;">Hi ${data.name},</p>
        <p style="font-size: 15px; color: #7A6A58; margin: 0 0 24px;">
          Thanks for reaching out. We've received your enquiry and will get 
          back to you within 1 business day.
        </p>
        <div style="background: #F2EDE6; border-radius: 8px; padding: 16px 20px; margin: 0 0 24px;">
          <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #7A6A58; margin: 0 0 8px;">Your message</p>
          <p style="font-size: 14px; color: #0E0B08; margin: 0; line-height: 1.6;">${data.message}</p>
        </div>
        <p style="font-size: 13px; color: #7A6A58; margin: 0;">
          In the meantime, you can browse our 
          <a href="${process.env.NEXT_PUBLIC_URL}/equipment" style="color:#B5481F;">equipment</a> 
          and 
          <a href="${process.env.NEXT_PUBLIC_URL}/packaging" style="color:#B5481F;">packaging</a> 
          catalogue.
        </p>
      </div>
    `,
  });

  // Notify you (the admin)
  await resend.emails.send({
    from: FROM,
    to: "ritual@roastandrecover.com",
    subject: `New enquiry from ${data.name} — ${data.company ?? data.email}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #0E0B08;">
        <p style="font-size: 18px; font-weight: 600; margin: 0 0 20px;">New lead</p>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#7A6A58;width:120px;">Name</td><td style="padding:6px 0;font-weight:500;">${data.name}</td></tr>
          <tr><td style="padding:6px 0;color:#7A6A58;">Email</td><td style="padding:6px 0;"><a href="mailto:${data.email}" style="color:#B5481F;">${data.email}</a></td></tr>
          ${data.company ? `<tr><td style="padding:6px 0;color:#7A6A58;">Company</td><td style="padding:6px 0;">${data.company}</td></tr>` : ""}
          ${data.phone ? `<tr><td style="padding:6px 0;color:#7A6A58;">Phone</td><td style="padding:6px 0;">${data.phone}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#7A6A58;">Interest</td><td style="padding:6px 0;">${data.interest ?? "General"}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e5e1db;margin:16px 0;" />
        <p style="font-size:13px;color:#7A6A58;margin:0 0 6px;">Message</p>
        <p style="font-size:14px;color:#0E0B08;line-height:1.6;margin:0;">${data.message}</p>
        <hr style="border:none;border-top:1px solid #e5e1db;margin:16px 0;" />
        <a href="${process.env.NEXT_PUBLIC_URL}/admin/leads/${lead.id}" style="display:inline-block;background:#B5481F;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:500;">
          View in admin →
        </a>
      </div>
    `,
  });

  return { success: true };
}

export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: status as any,
      ...(notes !== undefined && { notes }),
    },
  });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}