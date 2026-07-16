import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";

// npm install react-markdown
// Run: npm install react-markdown

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return {};
  return {
    title: post.seoTitle ?? `${post.title} — Roast & Recover`,
    description: post.seoDesc ?? post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
  });
  if (!post) notFound();

  const related = await prisma.blogPost.findMany({
    where: {
      published: true,
      id: { not: post.id },
      category: post.category,
    },
    take: 2,
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-8 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-ash hover:text-char mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to blog
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 text-xs text-ash">
          <span className="capitalize bg-steam px-2.5 py-1 rounded-full">
            {post.category}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {post.readingMins} min read
          </span>
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
        <h1 className="font-display font-semibold text-4xl text-char leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-ash text-[16px] leading-relaxed">{post.excerpt}</p>
      </div>

      {/* Cover image */}
      {post.coverUrl && (
        <div className="relative aspect-[16/9] bg-steam rounded-2xl overflow-hidden mb-10">
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-char prose-p:text-ash prose-p:leading-relaxed prose-a:text-ember prose-strong:text-char prose-li:text-ash">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Author */}
      <div className="mt-12 pt-8 border-t border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-steam flex items-center justify-center text-char font-medium text-sm flex-shrink-0">
          {post.authorName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-char">{post.authorName}</p>
          <p className="text-xs text-ash">Roast & Recover</p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 bg-steam rounded-2xl p-8 text-center">
        <p className="font-display font-semibold text-xl text-char mb-2">
          Ready to source direct?
        </p>
        <p className="text-ash text-sm mb-5">
          Browse certified equipment and packaging, direct from source.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/equipment"
            className="bg-ember hover:bg-ember-dark text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            Browse equipment
          </Link>
          <Link
            href="/contact"
            className="border border-border text-char px-5 py-2.5 rounded-md text-sm font-medium hover:border-ash/40 transition-colors"
          >
            Talk to us
          </Link>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="mt-12">
          <p className="text-xs uppercase tracking-wide text-ash mb-4">
            Related articles
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="border border-border rounded-xl p-4 hover:border-ember/30 transition-colors"
              >
                <p className="text-sm font-medium text-char mb-1 line-clamp-2">
                  {r.title}
                </p>
                <p className="text-xs text-ash">{r.readingMins} min read</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}