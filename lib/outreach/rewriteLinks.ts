// lib/outreach/rewriteLinks.ts
export function rewriteLinksForTracking(html: string, trackingId: string, baseUrl: string) {
    return html.replace(
      /href="(https?:\/\/[^"]+)"/g,
      (_, url) => `href="${baseUrl}/api/track/click/${trackingId}?url=${encodeURIComponent(url)}"`
    );
  }