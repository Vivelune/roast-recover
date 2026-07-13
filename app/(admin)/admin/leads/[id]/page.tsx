import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { updateLeadStatus } from "@/app/actions/leads";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, Building2, Package, ExternalLink,
} from "lucide-react";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  QUOTED: "bg-purple-50 text-purple-700 border-purple-200",
  CONVERTED: "bg-green-50 text-green-700 border-green-200",
  LOST: "bg-gray-100 text-gray-600 border-gray-200",
};

const statuses = ["NEW", "CONTACTED", "QUOTED", "CONVERTED", "LOST"];

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch lead AND the linked product in one query
  const lead = await prisma.lead.findUnique({
    where: { id },
  });
  if (!lead) notFound();

  // Fetch linked product separately (productId is a plain string, not a relation)
  const linkedProduct = lead.productId
    ? await prisma.product.findUnique({
        where: { id: lead.productId },
        include: { certification: true },
      })
    : null;

  async function handleUpdate(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    const notes = formData.get("notes") as string;
    await updateLeadStatus(id, status, notes);
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm text-ash hover:text-char mb-6"
      >
        <ArrowLeft size={14} /> Back to leads
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char mb-1">
            {lead.name}
          </h1>
          <p className="text-sm text-ash">
            Received{" "}
            {new Date(lead.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Badge
          variant="outline"
          className={statusColors[lead.status] ?? ""}
        >
          {lead.status}
        </Badge>
      </div>

      {/* Contact details */}
      <Card className="p-5 mb-4">
        <p className="text-xs uppercase tracking-wide text-ash mb-4">
          Contact details
        </p>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <Mail size={14} className="text-ash flex-shrink-0" />
            <a
              href={`mailto:${lead.email}`}
              className="text-ember hover:underline"
            >
              {lead.email}
            </a>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2.5 text-sm">
              <Phone size={14} className="text-ash flex-shrink-0" />
              <span className="text-char">{lead.phone}</span>
            </div>
          )}
          {lead.company && (
            <div className="flex items-center gap-2.5 text-sm">
              <Building2 size={14} className="text-ash flex-shrink-0" />
              <span className="text-char">{lead.company}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Linked product — only shown when lead came from a product page */}
      {linkedProduct && (
        <Card className="p-5 mb-4 border-ember/20 bg-steam/20">
          <p className="text-xs uppercase tracking-wide text-ash mb-3 flex items-center gap-1.5">
            <Package size={12} /> Enquiring about this product
          </p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-char">
                {linkedProduct.name}
              </p>
              <p className="text-xs text-ash mt-0.5">
                ${(linkedProduct.priceCents / 100).toFixed(2)}
                {linkedProduct.depositPercent &&
                  ` · ${linkedProduct.depositPercent}% deposit`}
                {linkedProduct.certification &&
                  ` · ${linkedProduct.certification.type} certified`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/equipment/${linkedProduct.slug}`}
                target="_blank"
                className="text-xs text-ember flex items-center gap-1 hover:underline"
              >
                View listing <ExternalLink size={11} />
              </Link>
              <span className="text-ash text-xs">·</span>
              <Link
                href={`/admin/products/${linkedProduct.id}/edit`}
                className="text-xs text-ash hover:text-char"
              >
                Edit product
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Message */}
      <Card className="p-5 mb-4">
        <p className="text-xs uppercase tracking-wide text-ash mb-1">
          Interest
        </p>
        <p className="text-sm text-char capitalize mb-4">
          {lead.interest ?? "General enquiry"}
        </p>
        <Separator className="mb-4" />
        <p className="text-xs uppercase tracking-wide text-ash mb-3">
          Message
        </p>
        <p className="text-sm text-char leading-relaxed whitespace-pre-wrap">
          {lead.message}
        </p>
      </Card>

      {/* Update status + notes */}
      <Card className="p-5">
        <p className="text-xs uppercase tracking-wide text-ash mb-4">
          Update lead
        </p>
        <form action={handleUpdate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-char font-medium">Status</label>
            <select
              name="status"
              defaultValue={lead.status}
              className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-white text-char focus:outline-none focus:ring-1 focus:ring-ember"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-char font-medium">
              Internal notes{" "}
              <span className="text-ash font-normal text-xs">
                (not visible to lead)
              </span>
            </label>
            <Textarea
              name="notes"
              defaultValue={lead.notes ?? ""}
              placeholder="Follow-up notes, quote details, pricing offered, next steps..."
              rows={4}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="bg-ember hover:bg-ember-dark">
              Save update
            </Button>
            {/* Quick action: reply directly */}
            <a
              href={`mailto:${lead.email}?subject=Re: Your enquiry — Roast %26 Recover`}
              className="inline-flex items-center gap-1.5 border border-border rounded-md px-4 py-2 text-sm text-char hover:bg-steam/40 transition-colors"
            >
              <Mail size={13} /> Reply by email
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
}