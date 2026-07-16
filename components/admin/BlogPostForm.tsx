import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function BlogPostForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults?: Record<string, any>;
}) {
  return (
    <Card className="p-6 sm:p-8 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-2xl bg-white">
      <form action={action} className="space-y-6">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-char">Title</Label>
          <Input
            name="title"
            required
            placeholder="How to choose a commercial espresso machine"
            defaultValue={defaults?.title}
            className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
          />
          <p className="text-[10px] text-ash font-medium uppercase tracking-wide">
            The canonical slug is auto-generated based on this title.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-char">Excerpt</Label>
          <Textarea
            name="excerpt"
            required
            rows={2}
            placeholder="A short summary shown in listings and search results..."
            defaultValue={defaults?.excerpt}
            className="rounded-xl border-gray-200 focus-visible:ring-char text-xs resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-char">Content (Markdown)</Label>
          <Textarea
            name="content"
            required
            rows={14}
            placeholder="## Introduction&#10;&#10;Your content here..."
            defaultValue={defaults?.content}
            className="font-mono text-xs rounded-xl border-gray-200 focus-visible:ring-char"
          />
          <p className="text-[10px] text-ash font-medium uppercase tracking-wide">
            Supports Standard Markdown: ## Headers, **bold**, *italic*, - lists, [links](url)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-char">Category</Label>
            <select
              name="category"
              defaultValue={defaults?.category ?? "guide"}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold bg-white text-char focus:outline-none focus:ring-1 focus:ring-char h-10"
            >
              <option value="guide">Guide</option>
              <option value="comparison">Comparison</option>
              <option value="news">News</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-char">Reading Time (minutes)</Label>
            <Input
              name="readingMins"
              type="number"
              min="1"
              defaultValue={defaults?.readingMins ?? 5}
              className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-char">Cover Image URL <span className="text-ash font-normal text-[10px] lowercase italic">(optional)</span></Label>
          <Input
            name="coverUrl"
            type="url"
            placeholder="https://..."
            defaultValue={defaults?.coverUrl}
            className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-char">
            Tags <span className="text-ash font-normal text-[10px] lowercase italic">(comma-separated)</span>
          </Label>
          <Input
            name="tags"
            placeholder="espresso, buying-guide, commercial"
            defaultValue={defaults?.tags?.join(", ")}
            className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-char">Author Name</Label>
          <Input
            name="authorName"
            defaultValue={defaults?.authorName ?? "Roast & Recover"}
            className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
          />
        </div>

        <div className="border-t border-gray-150 pt-6 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ash">SEO CONFIGURATION</p>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-char">SEO Title Override <span className="text-ash font-normal text-[10px] lowercase italic">(optional)</span></Label>
              <Input
                name="seoTitle"
                placeholder="Override the page title for search engines"
                defaultValue={defaults?.seoTitle}
                className="rounded-xl border-gray-200 focus-visible:ring-char text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-char">Meta Description <span className="text-ash font-normal text-[10px] lowercase italic">(optional)</span></Label>
              <Textarea
                name="seoDesc"
                rows={2}
                placeholder="155 characters max for best search snippet performance..."
                defaultValue={defaults?.seoDesc}
                maxLength={160}
                className="rounded-xl border-gray-200 focus-visible:ring-char text-xs resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 bg-[#FBFBFA]">
          <input
            type="checkbox"
            id="published"
            name="published"
            defaultChecked={defaults?.published ?? false}
            className="accent-char w-4 h-4 mt-0.5"
          />
          <Label htmlFor="published" className="cursor-pointer text-xs font-medium text-char leading-relaxed">
            Publish immediately — <span className="text-ash">Make this article active on public blog index grids immediately.</span>
          </Label>
        </div>

        <Button type="submit" className="w-full bg-char hover:bg-char/90 text-white rounded-xl h-11 font-bold uppercase tracking-wider text-xs">
          {defaults ? "Save changes" : "Create post"}
        </Button>
      </form>
    </Card>
  );
}