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
  ArrowLeft, Mail, Phone, Building2, Package, ExternalLink, Settings, Clock, MessageSquarePlus
} from "lucide-react";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50",
  QUOTED: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50",
  CONVERTED: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
  LOST: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
};

const statuses = ["NEW", "CONTACTED", "QUOTED", "CONVERTED", "LOST"];

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
  });
  if (!lead) notFound();

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Navigation and Actions */}
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ash hover:text-char transition-colors"
      >
        <ArrowLeft size={13} /> Back to all leads
      </Link>

      {/* Hero Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-150">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-ash uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={12} /> Received {new Date(lead.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
            {lead.name}
          </h1>
        </div>
        <div>
          <Badge
            variant="outline"
            className={`rounded-lg px-3 py-1 text-xs font-bold border uppercase tracking-wider ${statusColors[lead.status] ?? ""}`}
          >
            {lead.status}
          </Badge>
        </div>
      </div>

      {/* 2-Column Responsive Layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-14 items-start">
        
        {/* Left Column: Details & Associated Items */}
        <div className="space-y-8">
          
          {/* Linked Product context if applicable */}
          {linkedProduct && (
            <Card className="p-6 border-dashed border-emerald-600/30 bg-emerald-50/20 rounded-2xl space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Package size={13} /> Enquiring about Equipment
                  </p>
                  <p className="text-sm font-bold text-char mt-1.5">
                    {linkedProduct.name}
                  </p>
                  <p className="text-xs text-ash mt-0.5">
                    ${(linkedProduct.priceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    {linkedProduct.depositPercent && ` · ${linkedProduct.depositPercent}% Deposit Required`}
                    {linkedProduct.certification && ` · ${linkedProduct.certification.type} Certified`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/equipment/${linkedProduct.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5 hover:underline"
                  >
                    View Listing <ExternalLink size={11} />
                  </Link>
                  <span className="text-emerald-200 text-xs">·</span>
                  <Link
                    href={`/admin/products/${linkedProduct.id}/edit`}
                    className="text-xs font-semibold text-ash hover:text-char"
                  >
                    Edit Product
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Core Message / Enquiry */}
          <Card className="p-6 sm:p-8 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ash tracking-widest mb-1">
                Specified Interest
              </p>
              <span className="inline-block text-xs font-bold text-char uppercase tracking-wider bg-steam border border-gray-200 px-2.5 py-1 rounded-md">
                {lead.interest ?? "General enquiry"}
              </span>
            </div>
            
            <Separator className="border-gray-100" />
            
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ash tracking-widest mb-3.5">
                Client Message
              </p>
              <p className="text-sm sm:text-base text-char leading-relaxed whitespace-pre-wrap font-medium">
                "{lead.message}"
              </p>
            </div>
          </Card>

          {/* Demographic Card */}
          <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-[#FBFBFA] rounded-2xl space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ash tracking-widest">
              Contact Credentials
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-ash flex items-center gap-1.5 font-medium"><Mail size={13} /> Email address</span>
                <a href={`mailto:${lead.email}`} className="block font-bold text-char hover:text-ember transition-colors truncate">
                  {lead.email}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-ash flex items-center gap-1.5 font-medium"><Phone size={13} /> Contact phone</span>
                <span className="block font-bold text-char">
                  {lead.phone ?? <span className="text-ash italic font-normal">No phone</span>}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-ash flex items-center gap-1.5 font-medium"><Building2 size={13} /> Company context</span>
                <span className="block font-bold text-char">
                  {lead.company ?? <span className="text-ash italic font-normal">Private Buyer</span>}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Administrative sidebar actions */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <Card className="p-6 border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-150 pb-3">
              <Settings size={14} className="text-char" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-char tracking-widest">
                Lead Controls
              </p>
            </div>

            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-char uppercase tracking-wider">Pipeline Status</label>
                <select
                  name="status"
                  defaultValue={lead.status}
                  className="w-full border border-gray-150 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#FBFBFA] text-char focus:outline-none focus:ring-1 focus:ring-char transition-all cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s} className="font-semibold text-xs">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-char uppercase tracking-wider">Internal Notes</label>
                  <span className="text-[10px] text-ash font-medium italic">Confidential</span>
                </div>
                <Textarea
                  name="notes"
                  defaultValue={lead.notes ?? ""}
                  placeholder="Record quote variables, call summaries, or next logical engagement points..."
                  rows={4}
                  className="rounded-xl border-gray-150 text-xs focus-visible:ring-char leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <Button type="submit" className="w-full bg-char hover:bg-char/90 text-white text-xs font-bold uppercase tracking-wider h-11 rounded-xl">
                  Save Update
                </Button>
                
                <a
                  href={`mailto:${lead.email}?subject=Re: Your enquiry — Roast %26 Recover`}
                  className="w-full inline-flex items-center justify-center gap-1.5 border border-gray-150 rounded-xl h-11 text-xs font-bold uppercase tracking-wider text-char hover:bg-steam transition-colors"
                >
                  <Mail size={13} /> Reply by Email
                </a>
              </div>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}