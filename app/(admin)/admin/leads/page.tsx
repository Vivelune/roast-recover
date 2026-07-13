import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  QUOTED: "bg-purple-50 text-purple-700 border-purple-200",
  CONVERTED: "bg-green-50 text-green-700 border-green-200",
  LOST: "bg-gray-100 text-gray-600 border-gray-200",
};

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  const newCount = leads.filter((l) => l.status === "NEW").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char mb-1">
            Leads
          </h1>
          {newCount > 0 && (
            <p className="text-sm text-amber-600 font-medium">
              {newCount} new lead{newCount !== 1 ? "s" : ""} need attention
            </p>
          )}
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-steam flex items-center justify-center text-ash mx-auto mb-4">
            <MessageSquare size={20} />
          </div>
          <p className="text-char font-medium mb-1">No leads yet</p>
          <p className="text-ash text-sm">
            Enquiries from the contact form and quote requests will appear here.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-steam/40 border-b border-border">
              <tr>
                {["Name", "Company", "Interest", "Status", "Date"].map((h) => (
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
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border/50 last:border-0 hover:bg-steam/20"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="text-ember hover:underline font-medium"
                    >
                      {lead.name}
                    </Link>
                    <p className="text-xs text-ash">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 text-char">
                    {lead.company ?? (
                      <span className="text-ash">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ash capitalize">
                    {lead.interest ?? "General"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={statusColors[lead.status] ?? ""}
                    >
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-ash">
                    {new Date(lead.createdAt).toLocaleDateString()}
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