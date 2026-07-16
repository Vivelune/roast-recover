import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.NEXT_PUBLIC_URL!;

  const [equipment, packaging, posts] = await Promise.all([
    prisma.product.findMany({
      where: { category: "EQUIPMENT", active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { category: "PACKAGING", active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages = [
    { url: BASE, priority: 1.0 },
    { url: `${BASE}/equipment`, priority: 0.9 },
    { url: `${BASE}/packaging`, priority: 0.9 },
    { url: `${BASE}/why-roastandrecover`, priority: 0.8 },
    { url: `${BASE}/how-it-works`, priority: 0.7 },
    { url: `${BASE}/blog`, priority: 0.7 },
    { url: `${BASE}/about`, priority: 0.6 },
    { url: `${BASE}/contact`, priority: 0.6 },
    { url: `${BASE}/terms`, priority: 0.3 },
    { url: `${BASE}/privacy`, priority: 0.3 },
    { url: `${BASE}/shipping`, priority: 0.3 },
    { url: `${BASE}/returns`, priority: 0.3 },
  ];

  return [
    ...staticPages.map(({ url, priority }) => ({
      url,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...equipment.map((p) => ({
      url: `${BASE}/equipment/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...packaging.map((p) => ({
      url: `${BASE}/packaging/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}