// lib/outreach/linkifyBody.ts
export function linkifyPlainUrls(html: string): string {
    // Matches bare URLs not already inside an href="" attribute
    const urlRegex = /(?<!href=")(https?:\/\/[^\s<]+)/g;
    return html.replace(urlRegex, (url) => `<a href="${url}">${url}</a>`);
  }