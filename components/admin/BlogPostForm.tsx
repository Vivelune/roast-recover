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
    <Card className="p-6">
      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input
            name="title"
            required
            placeholder="How to choose a commercial espresso machine"
            defaultValue={defaults?.title}
          />
          <p className="text-xs text-ash">
            Slug is auto-generated from the title.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Excerpt</Label>
          <Textarea
            name="excerpt"
            required
            rows={2}
            placeholder="A short summary shown in listings and search results..."
            defaultValue={defaults?.excerpt}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Content (Markdown)</Label>
          <Textarea
            name="content"
            required
            rows={14}
            placeholder="## Introduction&#10;&#10;Your content here..."
            defaultValue={defaults?.content}
            className="font-mono text-xs"
          />
          <p className="text-xs text-ash">
            Supports Markdown: ## Headings, **bold**, *italic*, - lists,
            [links](url)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <select
              name="category"
              defaultValue={defaults?.category ?? "guide"}
              className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ember"
            >
              <option value="guide">Guide</option>
              <option value="comparison">Comparison</option>
              <option value="news">News</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Reading time (minutes)</Label>
            <Input
              name="readingMins"
              type="number"
              min="1"
              defaultValue={defaults?.readingMins ?? 5}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Cover image URL (optional)</Label>
          <Input
            name="coverUrl"
            type="url"
            placeholder="https://..."
            defaultValue={defaults?.coverUrl}
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            Tags{" "}
            <span className="text-ash text-xs">(comma-separated)</span>
          </Label>
          <Input
            name="tags"
            placeholder="espresso, buying-guide, commercial"
            defaultValue={defaults?.tags?.join(", ")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Author name</Label>
          <Input
            name="authorName"
            defaultValue={defaults?.authorName ?? "Roast & Recover"}
          />
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-xs uppercase tracking-wide text-ash">SEO</p>
          <div className="space-y-1.5">
            <Label>SEO title (optional)</Label>
            <Input
              name="seoTitle"
              placeholder="Override the page title for search engines"
              defaultValue={defaults?.seoTitle}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Meta description (optional)</Label>
            <Textarea
              name="seoDesc"
              rows={2}
              placeholder="155 characters max for best search results..."
              defaultValue={defaults?.seoDesc}
              maxLength={160}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            name="published"
            defaultChecked={defaults?.published ?? false}
            className="accent-ember w-4 h-4"
          />
          <Label htmlFor="published" className="cursor-pointer">
            Publish immediately
          </Label>
        </div>

        <Button type="submit" className="w-full bg-ember hover:bg-ember-dark">
          {defaults ? "Save changes" : "Create post"}
        </Button>
      </form>
    </Card>
  );
}