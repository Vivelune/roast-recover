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
      <div>
        <h1 className="font-display font-semibold text-2xl text-char mb-2">
          Company account
        </h1>
        <p className="text-ash text-sm mb-8">
          Set up a company account to manage multiple locations, team members,
          and consolidated billing.
        </p>
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
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-semibold text-2xl text-char mb-1">
            {company.name}
          </h1>
          <p className="text-ash text-sm">
            {company.members.length} member
            {company.members.length !== 1 ? "s" : ""} ·{" "}
            {currentMember?.role}
          </p>
        </div>
      </div>

      {/* Quarterly spend summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-border rounded-lg p-4">
          <p className="text-2xl font-display font-semibold text-char">
            ${(totalQuarterlySpend / 100).toFixed(0)}
          </p>
          <p className="text-xs text-ash mt-0.5">Spend last 90 days</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-2xl font-display font-semibold text-char">
            {allOrders.length}
          </p>
          <p className="text-xs text-ash mt-0.5">Orders last 90 days</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-2xl font-display font-semibold text-char">
            {company.members.length}
          </p>
          <p className="text-xs text-ash mt-0.5">Team members</p>
        </div>
      </div>

      {/* Per-location breakdown */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wide text-ash mb-3">
          Spend by location — last 90 days
        </p>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-steam/40 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-ash">Location / member</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ash">Orders</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ash">Spend</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-ash">Share</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(locationSpend).map(([userId, data]) => (
                <tr key={userId} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 text-char">{data.location}</td>
                  <td className="px-4 py-3 text-ash">{data.orderCount}</td>
                  <td className="px-4 py-3 text-char font-medium">
                    ${(data.spend / 100).toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-ash">
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

      {/* Team members */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ash mb-3">
          Team members
        </p>
        <div className="space-y-2">
          {company.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between border border-border rounded-lg px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-char">
                  {member.user.name ?? member.user.email}
                </p>
                <p className="text-xs text-ash">
                  {member.location ? `${member.location} · ` : ""}
                  {member.role}
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
                    className="text-xs text-ash hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite member — owners only */}
      {isOwner && (
        <CompanyClient companyId={company.id} />
      )}
    </div>
  );
}