import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deletePost } from "@/app/actions/blog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-semibold text-2xl text-char">
          Blog
        </h1>
        <Button asChild className="bg-ember hover:bg-ember-dark">
          <Link href="/admin/blog/new">
            <Plus size={15} className="mr-1.5" /> New post
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <p className="text-char font-medium mb-1">No posts yet</p>
          <p className="text-ash text-sm mb-4">
            Create SEO content that ranks for your buyers' searches.
          </p>
          <Button asChild className="bg-ember hover:bg-ember-dark">
            <Link href="/admin/blog/new">Write first post</Link>
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-steam/40 border-b border-border">
              <tr>
                {["Title", "Category", "Status", "Published", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-ash"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-border/50 last:border-0 hover:bg-steam/20"
                >
                  <td className="px-4 py-3 font-medium text-char max-w-[240px] truncate">
                    {post.title}
                  </td>
                  <td className="px-4 py-3 text-ash capitalize">
                    {post.category}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={post.published ? "default" : "outline"}>
                      {post.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ash text-xs">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.published && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-ash hover:text-ember transition-colors"
                        >
                          <Eye size={13} />
                        </Link>
                      )}
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-ash hover:text-char transition-colors"
                      >
                        <Pencil size={13} />
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deletePost(post.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-ash hover:text-red-500 transition-colors"
                          onClick={(e) => {
                            if (!confirm("Delete this post?"))
                              e.preventDefault();
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}