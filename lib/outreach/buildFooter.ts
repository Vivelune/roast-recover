// lib/outreach/buildFooter.ts
export function buildFooter(leadId: string, appUrl: string) {
    const unsubscribeUrl = `${appUrl}/unsubscribe?lead=${leadId}`;
    return `
      <p style="font-size:11px;color:#999;margin-top:32px;border-top:1px solid #eee;padding-top:12px;">
        Roast & Recover LLC — Sheridan, Wyoming, 82801<br/>
        <a href="${unsubscribeUrl}" style="color:#999;">Unsubscribe</a>
      </p>
    `;
  }