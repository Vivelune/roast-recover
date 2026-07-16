import { createPost } from "@/app/actions/blog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ash hover:text-char transition-colors"
      >
        <ArrowLeft size={13} /> Back to Blog
      </Link>
      <div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight mb-2">
          New Post
        </h1>
        <p className="text-sm text-ash">
          Write valuable content with rich layouts, SEO hooks, and markdown formatting.
        </p>
      </div>
      <BlogPostForm action={createPost} />
    </div>
  );
}