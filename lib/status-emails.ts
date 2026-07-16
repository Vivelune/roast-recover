import { Resend } from "resend";
import { createNotification, createActivityEntry } from "./notifications";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = "Roast & Recover <ritual@roastandrecover.com>";
const BASE = process.env.NEXT_PUBLIC_URL!;

type OrderItem = {
  id: string;
  product: { name: string; slug: string };
  quantity: number;
};

type OrderContext = {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  items: OrderItem[];
};

function greeting(name: string | null) {
  return name ? `Hi ${name.split(" ")[0]},` : "Hi,";
}

function baseHtml(content: string) {
  return `
    <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0E0B08;">
      <p style="font-size:18px;font-weight:600;margin:0 0 8px;">
        roast<span style="color:#B5481F;">&</span>recover
      </p>
      <hr style="border:none;border-top:1px solid #e5e1db;margin:16px 0 24px;"/>
      ${content}
      <hr style="border:none;border-top:1px solid #e5e1db;margin:24px 0 16px;"/>
      <p style="font-size:12px;color:#7A6A58;">
        Questions? Reply to this email or contact 
        <a href="mailto:ritual@roastandrecover.com" style="color:#B5481F;">
          ritual@roastandrecover.com
        </a>
      </p>
    </div>
  `;
}

export async function sendInProductionEmail(ctx: OrderContext) {
  const productName = ctx.items[0]?.product.name ?? "your machine";
  const multi = ctx.items.length > 1 ? ` and ${ctx.items.length - 1} more` : "";

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: ctx.userEmail,
      subject: `Your machine is being built — ${productName}`,
      html: baseHtml(`
        <p style="font-size:15px;margin:0 0 12px;">${greeting(ctx.userName)}</p>
        <p style="font-size:15px;color:#7A6A58;margin:0 0 20px;">
          Great news — your balance payment has been confirmed and 
          <strong style="color:#0E0B08;">${productName}${multi}</strong> 
          is now in production at our factory. We'll email you as soon as 
          it's shipped.
        </p>
        <a href="${BASE}/account/orders/${ctx.orderId}"
           style="display:inline-block;background:#B5481F;color:#fff;
                  text-decoration:none;padding:12px 24px;border-radius:6px;
                  font-size:14px;font-weight:500;">
          Track your order →
        </a>
      `),
    }),
    createNotification(ctx.userId, {
      type: "order_status",
      title: "Machine in production",
      body: `${productName}${multi} is being built and will ship soon.`,
      href: `/account/orders/${ctx.orderId}`,
    }),
    createActivityEntry(ctx.userId, {
      type: "balance_paid",
      title: `${productName}${multi} entered production`,
      metadata: { orderId: ctx.orderId },
    }),
  ]);
}

export async function sendShippedEmail(
  ctx: OrderContext,
  trackingNumber?: string,
  trackingUrl?: string
) {
  const productName = ctx.items[0]?.product.name ?? "your order";
  const multi = ctx.items.length > 1 ? ` and ${ctx.items.length - 1} more` : "";

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: ctx.userEmail,
      subject: `${productName} has shipped`,
      html: baseHtml(`
        <p style="font-size:15px;margin:0 0 12px;">${greeting(ctx.userName)}</p>
        <p style="font-size:15px;color:#7A6A58;margin:0 0 20px;">
          <strong style="color:#0E0B08;">${productName}${multi}</strong> 
          has left our facility and is on its way to you.
        </p>
        ${
          trackingNumber
            ? `
          <div style="background:#F2EDE6;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
            <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;
                       color:#7A6A58;margin:0 0 6px;">Tracking number</p>
            <p style="font-size:16px;font-weight:600;color:#0E0B08;margin:0;
                       font-family:monospace;">${trackingNumber}</p>
          </div>
          ${
            trackingUrl
              ? `<a href="${trackingUrl}" style="display:inline-block;
                   background:#3A3F42;color:#fff;text-decoration:none;
                   padding:10px 20px;border-radius:6px;font-size:13px;
                   font-weight:500;margin-bottom:20px;">
                   Track shipment →
                 </a>`
              : ""
          }`
            : ""
        }
        <a href="${BASE}/account/orders/${ctx.orderId}"
           style="display:inline-block;background:#B5481F;color:#fff;
                  text-decoration:none;padding:12px 24px;border-radius:6px;
                  font-size:14px;font-weight:500;">
          View order →
        </a>
      `),
    }),
    createNotification(ctx.userId, {
      type: "order_status",
      title: "Your order has shipped",
      body: `${productName}${multi} is on its way.${trackingNumber ? ` Tracking: ${trackingNumber}` : ""}`,
      href: `/account/orders/${ctx.orderId}`,
    }),
    createActivityEntry(ctx.userId, {
      type: "order_shipped",
      title: `${productName}${multi} shipped`,
      metadata: { orderId: ctx.orderId, trackingNumber },
    }),
  ]);
}

export async function sendDeliveredEmail(ctx: OrderContext) {
  const productName = ctx.items[0]?.product.name ?? "your machine";
  const reviewUrl = `${BASE}/${
    ctx.items[0]?.product
      ? `equipment/${ctx.items[0].product.slug}`
      : "equipment"
  }#reviews`;

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: ctx.userEmail,
      subject: `${productName} delivered — how is it?`,
      html: baseHtml(`
        <p style="font-size:15px;margin:0 0 12px;">${greeting(ctx.userName)}</p>
        <p style="font-size:15px;color:#7A6A58;margin:0 0 20px;">
          Your <strong style="color:#0E0B08;">${productName}</strong> has been 
          marked as delivered. We hope everything arrived in perfect condition.
        </p>
        <p style="font-size:15px;color:#7A6A58;margin:0 0 20px;">
          If you have a moment, a review helps other café operators make confident 
          buying decisions — and tells us how we're doing.
        </p>
        <a href="${reviewUrl}"
           style="display:inline-block;background:#B5481F;color:#fff;
                  text-decoration:none;padding:12px 24px;border-radius:6px;
                  font-size:14px;font-weight:500;margin-right:12px;">
          Leave a review →
        </a>
        <a href="${BASE}/account/orders/${ctx.orderId}"
           style="display:inline-block;background:transparent;color:#7A6A58;
                  text-decoration:none;padding:12px 0;
                  font-size:14px;">
          View order
        </a>
        <p style="font-size:13px;color:#7A6A58;margin:24px 0 0;">
          Notice any issues? Contact us within 7 days of delivery and we'll 
          make it right.
        </p>
      `),
    }),
    createNotification(ctx.userId, {
      type: "review_request",
      title: "Order delivered — leave a review",
      body: `How is your ${productName}? Share your experience.`,
      href: reviewUrl,
    }),
    createActivityEntry(ctx.userId, {
      type: "order_delivered",
      title: `${productName} delivered`,
      metadata: { orderId: ctx.orderId },
    }),
  ]);
}