import { createPost } from "@/app/actions/blog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1.5 text-sm text-ash hover:text-char mb-6"
      >
        <ArrowLeft size={14} /> Back to blog
      </Link>
      <h1 className="font-display font-semibold text-2xl text-char mb-8">
        New post
      </h1>
      <BlogPostForm action={createPost} />
    </div>
  );
}