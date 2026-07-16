import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowRight } from "lucide-react";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50",
  QUOTED: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50",
  CONVERTED: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
  LOST: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
};

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  const newCount = leads.filter((l) => l.status === "NEW").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-150">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-char tracking-tight">
            Leads Management
          </h1>
          {newCount > 0 ? (
            <p className="text-sm text-amber font-medium mt-1">
              {newCount} new lead{newCount !== 1 ? "s" : ""} require attention
            </p>
          ) : (
            <p className="text-xs text-ash mt-1 font-medium uppercase tracking-wider">
              All active enquiries & quotes
            </p>
          )}
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-24 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-steam/60 border border-gray-200/30 flex items-center justify-center text-char mx-auto mb-6">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-semibold text-char text-lg mb-2">No leads registered</h3>
          <p className="text-ash text-sm leading-relaxed">
            Inquiries from site contact forms and individual quote requests will be systematically logged here.
          </p>
        </div>
      ) : (
        /* Responsive, spacious table layout container */
        <Card className="overflow-hidden border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl">
          <div className="w-full overflow-x-auto no-scrollbar">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-[#FBFBFA] border-b border-gray-150">
                <tr>
                  {["Name / Email", "Company", "Primary Interest", "Status", "Received Date"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-ash"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-steam/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="font-semibold text-char hover:text-ember transition-colors inline-flex items-center gap-1.5"
                        >
                          {lead.name}
                          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-ember" />
                        </Link>
                        <p className="text-xs text-ash">{lead.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-char font-medium">
                      {lead.company ? (
                        <span>{lead.company}</span>
                      ) : (
                        <span className="text-ash text-xs italic">Individual</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-ash uppercase tracking-wider bg-steam/60 border border-gray-200/40 px-2 py-1 rounded-md">
                        {lead.interest ?? "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`rounded-lg px-2.5 py-0.5 text-xs font-bold border uppercase tracking-wider ${statusColors[lead.status] ?? ""}`}
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-ash font-medium text-xs">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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