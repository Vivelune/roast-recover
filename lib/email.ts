import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = "roast & recover <ritual@roastandrecover.com>";
// Until your domain is verified in Resend, use:
// "Roast & Recover <onboarding@resend.dev>"
// Switch to your real domain once DNS records are added

export async function sendBalancePaymentEmail({
  to,
  customerName,
  productName,
  balanceAmount,
  checkoutUrl,
  orderId,
}: {
  to: string;
  customerName: string | null;
  productName: string;
  balanceAmount: number;
  checkoutUrl: string;
  orderId: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${productName} is ready — balance payment due`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #0E0B08;">
        <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">
          roast<span style="color: #B5481F;">&</span>recover
        </p>
        <hr style="border: none; border-top: 1px solid #e5e1db; margin: 16px 0 24px;" />

        <p style="font-size: 15px; margin: 0 0 12px;">
          Hi ${customerName ?? "there"},
        </p>
        <p style="font-size: 15px; color: #7A6A58; margin: 0 0 24px;">
          Your <strong style="color: #0E0B08;">${productName}</strong> has been 
          sourced and certified — it's ready to ship once we receive your 
          remaining balance.
        </p>

        <div style="background: #F2EDE6; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
          <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #7A6A58; margin: 0 0 8px;">
            Balance due
          </p>
          <p style="font-size: 28px; font-weight: 600; color: #0E0B08; margin: 0;">
            $${(balanceAmount / 100).toFixed(2)}
          </p>
        </div>

        <a href="${checkoutUrl}"
          style="display: inline-block; background: #B5481F; color: #ffffff; 
                 text-decoration: none; padding: 12px 24px; border-radius: 6px; 
                 font-size: 14px; font-weight: 500;">
          Pay balance &amp; confirm shipment →
        </a>

        <p style="font-size: 13px; color: #7A6A58; margin: 24px 0 0;">
          Once payment is confirmed, your machine ships within 1–2 business days.
          <br />View your order: 
          <a href="${process.env.NEXT_PUBLIC_URL}/account/orders/${orderId}" 
             style="color: #B5481F;">
            Order #${orderId.slice(-8).toUpperCase()}
          </a>
        </p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderId,
  items,
  total,
  isEquipment,
}: {
  to: string;
  customerName: string | null;
  orderId: string;
  items: { name: string; quantity: number; priceCents: number }[];
  total: number;
  isEquipment: boolean;
}) {
  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #0E0B08; border-bottom: 1px solid #e5e1db;">
          ${i.name} × ${i.quantity}
        </td>
        <td style="padding: 8px 0; font-size: 14px; color: #0E0B08; text-align: right; border-bottom: 1px solid #e5e1db;">
          $${((i.priceCents * i.quantity) / 100).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Order confirmed — ${items[0]?.name}${items.length > 1 ? ` +${items.length - 1} more` : ""}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #0E0B08;">
        <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">
          roast<span style="color: #B5481F;">&</span>recover
        </p>
        <hr style="border: none; border-top: 1px solid #e5e1db; margin: 16px 0 24px;" />

        <p style="font-size: 15px; margin: 0 0 8px;">Hi ${customerName ?? "there"},</p>
        <p style="font-size: 15px; color: #7A6A58; margin: 0 0 24px;">
          ${isEquipment
            ? "Your equipment deposit has been received. We'll be in touch once your machines are ready to ship."
            : "Your order has been confirmed and is being prepared for shipment."
          }
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px;">
          ${itemRows}
          <tr>
            <td style="padding: 12px 0 0; font-size: 14px; font-weight: 600; color: #0E0B08;">
              ${isEquipment ? "Deposit paid" : "Total"}
            </td>
            <td style="padding: 12px 0 0; font-size: 14px; font-weight: 600; color: #0E0B08; text-align: right;">
              $${(total / 100).toFixed(2)}
            </td>
          </tr>
        </table>

        <a href="${process.env.NEXT_PUBLIC_URL}/account/orders/${orderId}"
          style="display: inline-block; background: #B5481F; color: #ffffff;
                 text-decoration: none; padding: 12px 24px; border-radius: 6px;
                 font-size: 14px; font-weight: 500;">
          View order →
        </a>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmationEmail({
  to,
  customerName,
  productName,
  intervalDays,
  priceCents,
}: {
  to: string;
  customerName: string | null;
  productName: string;
  intervalDays: number;
  priceCents: number;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Auto-reorder set up — ${productName}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #0E0B08;">
        <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">
          roast<span style="color: #B5481F;">&</span>recover
        </p>
        <hr style="border: none; border-top: 1px solid #e5e1db; margin: 16px 0 24px;" />

        <p style="font-size: 15px; margin: 0 0 8px;">Hi ${customerName ?? "there"},</p>
        <p style="font-size: 15px; color: #7A6A58; margin: 0 0 16px;">
          Auto-reorder is now active for <strong style="color: #0E0B08;">${productName}</strong>.
          You'll be charged <strong style="color: #0E0B08;">$${(priceCents / 100).toFixed(2)}</strong> 
          every <strong style="color: #0E0B08;">${intervalDays} days</strong> automatically.
        </p>
        <p style="font-size: 14px; color: #7A6A58; margin: 0 0 24px;">
          Cancel anytime from your account dashboard.
        </p>
        <a href="${process.env.NEXT_PUBLIC_URL}/account/subscriptions"
          style="display: inline-block; background: #B5481F; color: #ffffff;
                 text-decoration: none; padding: 12px 24px; border-radius: 6px;
                 font-size: 14px; font-weight: 500;">
          Manage subscriptions →
        </a>
      </div>
    `,
  });
}