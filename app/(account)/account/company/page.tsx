import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateCompanyForm from "@/components/CreateCompanyForm";
import CompanyClient from "@/components/CompanyClient";

export default async function CompanyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  if (!user.companyId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char tracking-tight">
            Company Account
          </h1>
          <p className="text-ash text-sm mt-0.5">
            Set up a company profile to manage multiple retail locations, team permissions, and consolidated enterprise billing.
          </p>
        </div>
        <CreateCompanyForm />
      </div>
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    include: {
      members: { include: { user: true } },
      addresses: true,
    },
  });

  if (!company) redirect("/account");

  // Get per-location spend data
  const memberUsers = company.members.map((m) => m.user);
  const allOrders = await prisma.order.findMany({
    where: {
      userId: { in: memberUsers.map((u) => u.id) },
      status: { notIn: ["PENDING", "PENDING_DEPOSIT", "CANCELLED"] },
      createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  // Quarterly spend per location
  const locationSpend = company.members.reduce(
    (acc, member) => {
      const memberOrders = allOrders.filter(
        (o) => o.userId === member.userId
      );
      const spend = memberOrders.reduce(
        (sum, o) =>
          sum +
          o.items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0),
        0
      );
      return {
        ...acc,
        [member.userId]: {
          location: member.location ?? member.user.email,
          spend,
          orderCount: memberOrders.length,
        },
      };
    },
    {} as Record<string, { location: string; spend: number; orderCount: number }>
  );

  const totalQuarterlySpend = Object.values(locationSpend).reduce(
    (sum, l) => sum + l.spend,
    0
  );

  const currentMember = company.members.find(
    (m) => m.userId === user.id
  );
  const isOwner = currentMember?.role === "OWNER";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header section */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="font-display font-semibold text-2xl text-char tracking-tight">
          {company.name}
        </h1>
        <p className="text-ash text-xs font-bold uppercase tracking-wider mt-1">
          {company.members.length} member{company.members.length !== 1 ? "s" : ""} &bull; {currentMember?.role}
        </p>
      </div>

      {/* Quarterly spend summary widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl p-5">
          <p className="text-2xl font-display font-bold text-char tracking-tight">
            ${(totalQuarterlySpend / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ash mt-1">Spend Last 90 Days</p>
        </div>
        <div className="border border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl p-5">
          <p className="text-2xl font-display font-bold text-char tracking-tight">
            {allOrders.length}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ash mt-1">Orders Last 90 Days</p>
        </div>
        <div className="border border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl p-5">
          <p className="text-2xl font-display font-bold text-char tracking-tight">
            {company.members.length}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ash mt-1">Active Team Members</p>
        </div>
      </div>

      {/* Per-location breakdown metric tables */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ash">
          Spend breakdown by branch &bull; 90 Days
        </p>
        <div className="border border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl overflow-hidden">
          <div className="w-full overflow-x-auto no-scrollbar">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-[#FBFBFA] border-b border-gray-150">
                <tr>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-ash">Location / Member</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-ash">Orders Placed</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-ash">Total Spend</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-ash">Volume Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(locationSpend).map(([userId, data]) => (
                  <tr key={userId} className="hover:bg-steam/20 transition-colors">
                    <td className="px-5 py-3.5 text-char font-semibold">{data.location}</td>
                    <td className="px-5 py-3.5 text-ash font-medium">{data.orderCount}</td>
                    <td className="px-5 py-3.5 text-char font-bold">
                      ${(data.spend / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-5 py-3.5 text-ash font-bold">
                      {totalQuarterlySpend > 0
                        ? `${Math.round((data.spend / totalQuarterlySpend) * 100)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Team roster logs */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ash">
          Team Roster
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {company.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between border border-gray-150 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-white rounded-2xl px-5 py-4"
            >
              <div>
                <p className="text-sm font-bold text-char">
                  {member.user.name ?? member.user.email}
                </p>
                <p className="text-xs text-ash font-medium mt-0.5">
                  {member.location ? `${member.location} · ` : ""}
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-steam text-char px-1.5 py-0.5 rounded border border-gray-200/40 ml-0.5">
                    {member.role.toLowerCase()}
                  </span>
                </p>
              </div>
              {isOwner && member.userId !== user.id && (
                <form
                  action={async () => {
                    "use server";
                    const { removeMember } = await import(
                      "@/app/actions/company"
                    );
                    await removeMember(company.id, member.userId);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs font-bold uppercase tracking-wider text-ash hover:text-red-500 transition-colors px-2 py-1 border border-gray-200 hover:border-red-100 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite member form overlay — structural owners only */}
      {isOwner && (
        <div className="pt-4">
          <CompanyClient companyId={company.id} />
        </div>
      )}
    </div>
  );
}