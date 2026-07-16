import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deletePost } from "@/app/actions/blog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Eye, FileText } from "lucide-react";
import DeletePostButton from "@/components/admin/DeletePostButton";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight mb-2">
            Blog Posts
          </h1>
          <p className="text-sm text-ash">
            Manage your publication pipeline, craft SEO-friendly articles, and write resource guides.
          </p>
        </div>
        <Button asChild className="bg-char hover:bg-char/90 text-white rounded-xl h-10 px-5 font-bold uppercase tracking-wider text-xs self-start sm:self-auto">
          <Link href="/admin/blog/new">
            <Plus size={14} className="mr-2" /> New post
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-150 rounded-2xl bg-white">
          <div className="w-12 h-12 rounded-2xl bg-steam flex items-center justify-center text-ash mx-auto mb-4 border border-gray-100">
            <FileText size={20} className="text-char" />
          </div>
          <p className="text-char font-semibold">No posts on record</p>
          <p className="text-ash text-xs mt-1 mb-6 max-w-sm mx-auto">
            Create high-quality authority content to increase organic search results and direct target traffic.
          </p>
          <Button asChild className="bg-char hover:bg-char/90 text-white rounded-xl h-10 px-6 font-bold uppercase tracking-wider text-xs">
            <Link href="/admin/blog/new">Write first post</Link>
          </Button>
        </div>
      ) : (
        <Card className="overflow-hidden border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl">
          <div className="w-full overflow-x-auto no-scrollbar">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-[#FBFBFA] border-b border-gray-150">
                <tr>
                  {["Title", "Category", "Status", "Published Date", "Operations"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-ash">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-steam/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-char max-w-[280px] truncate">
                      {post.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border bg-steam text-ash border-gray-200/40">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={post.published ? "default" : "outline"}
                        className={`text-[10px] font-bold uppercase tracking-wider rounded-lg px-2 py-0.5 border ${
                          post.published 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-gray-50 text-ash border-gray-200"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-char">
                      {post.publishedAt ? (
                        new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      ) : (
                        <span className="text-ash italic font-normal">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 select-none">
                        {post.published && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 hover:bg-steam text-char transition-colors"
                          >
                            <Eye size={13} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 hover:bg-steam text-char transition-colors"
                        >
                          <Pencil size={13} />
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deletePost(post.id);
                          }}
                        >
                          <DeletePostButton />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}