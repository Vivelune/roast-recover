import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import { Clock, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Blog — Roast & Recover",
  description:
    "Guides, comparisons, and insights for café operators — equipment sourcing, packaging, and running a better coffee operation.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  const featured = posts[0];
  const rest = posts.slice(1);

  const categoryColors: Record<string, string> = {
    guide: "bg-blue-50 text-blue-700",
    comparison: "bg-purple-50 text-purple-700",
    news: "bg-green-50 text-green-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <FadeIn>
        <p className="text-xs uppercase tracking-[0.15em] text-ember font-medium mb-3">
          Resources
        </p>
        <h1 className="font-display font-semibold text-4xl text-char mb-3">
          For café operators.
        </h1>
        <p className="text-ash text-[15px] mb-12 max-w-md">
          Practical guides and honest comparisons to help you make better
          decisions about equipment, packaging, and operations.
        </p>
      </FadeIn>

      {posts.length === 0 ? (
        <p className="text-ash text-center py-16">
          No posts yet — check back soon.
        </p>
      ) : (
        <>
          {/* Featured post */}
          {featured && (
            <FadeIn>
              <Link href={`/blog/${featured.slug}`} className="group block mb-12">
                <div className="grid md:grid-cols-2 gap-8 border border-border rounded-2xl p-6 hover:border-ember/30 transition-colors">
                  {featured.coverUrl && (
                    <div className="relative aspect-[4/3] bg-steam rounded-xl overflow-hidden">
                      <Image
                        src={featured.coverUrl}
                        alt={featured.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                          categoryColors[featured.category] ?? "bg-steam text-ash"
                        }`}
                      >
                        {featured.category}
                      </span>
                      <span className="text-xs text-ash flex items-center gap-1">
                        <Clock size={11} /> {featured.readingMins} min read
                      </span>
                    </div>
                    <h2 className="font-display font-semibold text-2xl text-char mb-3 group-hover:text-ember transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-ash text-sm leading-relaxed mb-4">
                      {featured.excerpt}
                    </p>
                    <span className="text-ember text-sm font-medium flex items-center gap-1.5">
                      Read article <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          )}

          {/* Rest of posts */}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <FadeIn key={post.id} delay={i * 0.05}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block border border-border rounded-xl p-5 hover:border-ember/30 transition-colors h-full flex flex-col"
                  >
                    {post.coverUrl && (
                      <div className="relative aspect-[16/9] bg-steam rounded-lg overflow-hidden mb-4">
                        <Image
                          src={post.coverUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="33vw"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          categoryColors[post.category] ?? "bg-steam text-ash"
                        }`}
                      >
                        {post.category}
                      </span>
                      <span className="text-xs text-ash">
                        {post.readingMins} min
                      </span>
                    </div>
                    <h3 className="font-medium text-char text-sm mb-2 leading-snug group-hover:text-ember transition-colors flex-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-ash leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}